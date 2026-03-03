import BlogPost from '../models/BlogPost.js';
import slugify from 'slugify';
import jwt from 'jsonwebtoken';
import cloudinary, { uploadToCloudinary } from '../config/cloudinary.js';
import multer from 'multer';

// Multer config for memory storage (Blog Cover Image)
const storage = multer.memoryStorage();
export const uploadBlogImages = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
}).single('coverImage');

// Helper to flatten post for a specific language
const flattenPost = (post, lang) => {
    if (!post) return null;
    const p = post.toObject ? post.toObject() : post;

    const getLocalized = (field, preferredLang) => {
        if (typeof field === 'string') return field; // Legacy string support
        if (!field) return '';
        return field[preferredLang] || field['en'] || '';
    };

    return {
        ...p,
        title: getLocalized(p.title, lang),
        content: getLocalized(p.content, lang),
        excerpt: getLocalized(p.excerpt, lang),
        slug: getLocalized(p.slug, lang),
        slugs: p.slug, // Pass full localized object for language switching
        metaDescription: getLocalized(p.metaDescription, lang),
        metaKeywords: p.metaKeywords?.[lang] || p.metaKeywords || [],
        status: p.status || 'draft', // Return global status
        coverImageAlt: getLocalized(p.coverImageAlt, lang),
        // Remove raw localized objects to clean up response
        // title: undefined, content: undefined, etc.
    };
};

// Get all posts (public + admin filters)
export const getPosts = async (req, res) => {
    try {
        const { status, limit, category, language } = req.query;
        const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

        const query = {};

        // Security Check
        let isAdmin = false;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_KEY);
                if (decoded.role === 'admin' || decoded.role === 'editor') {
                    isAdmin = true;
                }
            } catch (err) {
                // Invalid token
            }
        }

        const targetLang = language || 'en'; // Default to EN for filtering

        // If not admin, FORCE filtered by published status
        if (!isAdmin) {
            query.status = 'published';
        } else {
            // Admin can filter by status
            if (status) {
                query.status = status;
            }
        }

        if (category && category !== 'All') query.category = category;

        // Language filter removed from query because posts contain both languages.
        // We only use language param to format the RESPONSE.

        let postsQuery = BlogPost.find(query)
            .populate('author', 'username avatar')
            .sort({ publishedAt: -1, createdAt: -1 });

        if (limit) {
            postsQuery = postsQuery.limit(parseInt(limit));
        }

        const posts = await postsQuery;

        // If language param is provided (public view), flatten the response
        if (language) {
            const flattenedPosts = posts.map(p => flattenPost(p, language));
            return res.status(200).json(flattenedPosts);
        }

        // Otherwise return full raw objects (Admin view)
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single post by slug (Localized)
export const getPostBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const { language } = req.query; // Valid 'en' or 'fr'
        const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

        // Security Check
        let isAdmin = false;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_KEY);
                if (decoded.role === 'admin' || decoded.role === 'editor') {
                    isAdmin = true;
                }
            } catch (err) {
                // Invalid token
            }
        }

        // Build Query
        const query = {};

        if (isAdmin) {
            // Admin: Just match slug in either language
            query['$or'] = [
                { 'slug.en': slug },
                { 'slug.fr': slug }
            ];
        } else {
            // Public: Access only if GLOBALLY published
            // AND the slug matches the requested language logic
            query.status = 'published';

            if (language === 'en') {
                query['slug.en'] = slug;
            } else if (language === 'fr') {
                query['slug.fr'] = slug;
            } else {
                // Fallback: Match slug in either
                query['$or'] = [
                    { 'slug.en': slug },
                    { 'slug.fr': slug }
                ];
            }
        }

        const post = await BlogPost.findOneAndUpdate(
            query,
            { $inc: { views: 1 } },
            { new: true }
        ).populate('author', 'username avatar bio');

        if (!post) return res.status(404).json({ message: 'Post not found' });

        // If language requested, flatten
        if (language) {
            return res.status(200).json(flattenPost(post, language));
        }

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single post by ID (Admin)
export const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await BlogPost.findById(id).populate('author', 'username avatar');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper: Validate JSON fields from generic parsing
const parseJSON = (field) => {
    try {
        return typeof field === 'string' ? JSON.parse(field) : field
    } catch (e) {
        return field // Return original if not JSON string (might be plain string or object)
    }
}

// Helper to ensure localized fields have both EN and FR
const ensureLocalized = (data) => {
    const fields = ['title', 'content', 'excerpt', 'metaDescription', 'coverImageAlt'];

    fields.forEach(field => {
        if (data[field]) {
            // data[field] might be JSON string if coming from FormData
            let val = data[field];
            if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
                try { val = JSON.parse(val); } catch (e) { }
            }
            if (typeof val === 'object') {
                data[field] = val; // Ensure it's object

                // If EN is present but FR is missing/empty, use EN
                if (data[field].en && !data[field].fr) {
                    data[field].fr = data[field].en;
                }
                // If FR is present but EN is missing/empty, use FR
                if (data[field].fr && !data[field].en) {
                    data[field].en = data[field].fr;
                }
            }
        }
    });

    // Special handling for keywords (Arrays)
    if (data.metaKeywords) {
        let val = data.metaKeywords;
        if (typeof val === 'string') {
            try { val = JSON.parse(val); } catch (e) { }
        }
        data.metaKeywords = val;

        if (data.metaKeywords.en && (!data.metaKeywords.fr || data.metaKeywords.fr.length === 0)) {
            data.metaKeywords.fr = data.metaKeywords.en;
        }
        if (data.metaKeywords.fr && (!data.metaKeywords.en || data.metaKeywords.en.length === 0)) {
            data.metaKeywords.en = data.metaKeywords.fr;
        }
    }

    return data;
};

// Create post (Admin/Editor)
export const createPost = async (req, res) => {
    try {
        // Handle fields parsing since FormData sends everything as strings
        const postData = ensureLocalized({ ...req.body });

        let coverImageUrl = '';
        if (req.file) {
            coverImageUrl = await uploadToCloudinary(req.file.buffer);
        } else if (req.body.coverImage) {
            // Allow manual URL if no file uploaded
            coverImageUrl = req.body.coverImage;
        } else {
            return res.status(400).json({ message: 'Cover image is required' });
        }

        const newPost = new BlogPost({
            ...postData,
            coverImage: coverImageUrl,
            author: (req.user.role === 'admin' && req.body.author) ? req.body.author : req.user.userId
        });

        if (newPost.status === 'published' && !newPost.publishedAt) {
            newPost.publishedAt = new Date();
        }

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Create Post Error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Update post (Admin/Editor)
export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        // Parse fields
        const updates = ensureLocalized({ ...req.body });

        const post = await BlogPost.findById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Handle Image Update
        if (req.file) {
            const newCoverUrl = await uploadToCloudinary(req.file.buffer);

            // Delete old image if it exists and is cloudinary
            if (post.coverImage) {
                const extractPublicId = (url) => {
                    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i;
                    const match = url.match(regex);
                    return match ? match[1] : null;
                };
                const publicId = extractPublicId(post.coverImage);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                }
            }
            updates.coverImage = newCoverUrl;
        }

        // Manually update fields
        Object.keys(updates).forEach(key => {
            post[key] = updates[key];
        });

        if (post.status === 'published' && !post.publishedAt) {
            post.publishedAt = new Date();
        }

        await post.save();
        res.status(200).json(post);
    } catch (error) {
        console.error('Update Post Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete post (Admin)
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await BlogPost.findById(id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Delete Image
        if (post.coverImage) {
            const extractPublicId = (url) => {
                const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i;
                const match = url.match(regex);
                return match ? match[1] : null;
            };
            const publicId = extractPublicId(post.coverImage);
            if (publicId) {
                console.log('Deleting Blog Image:', publicId);
                await cloudinary.uploader.destroy(publicId);
            }
        }

        await BlogPost.findByIdAndDelete(id);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
