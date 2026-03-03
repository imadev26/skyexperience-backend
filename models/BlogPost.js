import mongoose from 'mongoose';
import slugify from 'slugify';

const blogPostSchema = new mongoose.Schema({
    title: {
        en: { type: String, required: true, trim: true },
        fr: { type: String, required: true, trim: true }
    },
    slug: {
        en: { type: String, unique: true },
        fr: { type: String, unique: true }
    },
    content: {
        en: { type: String, required: true },
        fr: { type: String, required: true }
    },
    excerpt: {
        en: { type: String, required: true, maxlength: 300 },
        fr: { type: String, required: true, maxlength: 300 }
    },
    // Shared Fields
    coverImage: {
        type: String,
        required: [true, 'Please provide a cover image']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
    readTime: {
        type: String,
        default: '5 min read'
    },
    views: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    publishedAt: {
        type: Date
    },
    // SEO Fields (Localized)
    metaDescription: {
        en: { type: String, trim: true, maxlength: 160 },
        fr: { type: String, trim: true, maxlength: 160 }
    },
    metaKeywords: {
        en: { type: [String], default: [] },
        fr: { type: [String], default: [] }
    },
    coverImageAlt: {
        en: { type: String, trim: true },
        fr: { type: String, trim: true }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Auto-fill missing translations before validation
blogPostSchema.pre('validate', function (next) {
    const fields = ['title', 'content', 'excerpt', 'metaDescription', 'coverImageAlt'];

    fields.forEach(field => {
        if (this[field]) {
            // If EN is present but FR is missing/empty, use EN
            if (this[field].en && !this[field].fr) {
                this[field].fr = this[field].en;
            }
            // If FR is present but EN is missing/empty, use FR
            if (this[field].fr && !this[field].en) {
                this[field].en = this[field].fr;
            }
        }
    });

    // Special handling for keywords
    if (this.metaKeywords) {
        if (this.metaKeywords.en && this.metaKeywords.en.length > 0 && (!this.metaKeywords.fr || this.metaKeywords.fr.length === 0)) {
            this.metaKeywords.fr = this.metaKeywords.en;
        }
        if (this.metaKeywords.fr && this.metaKeywords.fr.length > 0 && (!this.metaKeywords.en || this.metaKeywords.en.length === 0)) {
            this.metaKeywords.en = this.metaKeywords.fr;
        }
    }

    next();
});

// Create slugs from titles before saving, BUT respect manual slugs if provided
blogPostSchema.pre('save', function (next) {
    // English Slug
    if (!this.slug.en || (this.isModified('title.en') && !this.isModified('slug.en'))) {
        if (this.title.en) {
            this.slug.en = slugify(this.title.en, { lower: true, strict: true });
        }
    }

    // French Slug
    if (!this.slug.fr || (this.isModified('title.fr') && !this.isModified('slug.fr'))) {
        if (this.title.fr) {
            this.slug.fr = slugify(this.title.fr, { lower: true, strict: true });
        }
    }

    next();
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

export default BlogPost;
