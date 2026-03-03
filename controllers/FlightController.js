import Flight from '../models/Flight.js'
import cloudinary, { uploadToCloudinary } from '../config/cloudinary.js'
import mongoose from 'mongoose'
import slugify from 'slugify'
import jwt from 'jsonwebtoken'
import multer from 'multer'

// Multer config for memory storage
const storage = multer.memoryStorage()
export const uploadFlightImages = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 21 // 1 main + 20 gallery
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only images are allowed'))
    }
  }
}).fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'images', maxCount: 20 }
])

// Get all flights (Public)
// Get all flights (Public)
export const getFlights = async (req, res) => {
  try {
    const { lang, featured, limit } = req.query
    console.log('GET /flights query:', req.query);

    // Build Query — Only return ACTIVE flights on public route
    let query = { status: 'active' };

    if (featured === 'true' || featured === true) {
      query.featured = true;
    }

    // Initialize Query
    let flightQuery = Flight.find(query)
      .select('-__v')
      .sort({ featured: -1, createdAt: -1 });

    // Apply Limit if provided
    if (limit) {
      const limitVal = parseInt(limit);
      if (!isNaN(limitVal) && limitVal > 0) {
        console.log(`Applying limit: ${limitVal}`);
        flightQuery = flightQuery.limit(limitVal);
      }
    }

    const flights = await flightQuery;

    res.json({ success: true, flights })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching flights', error: error.message })
  }
}

// Get all flights (Admin)
export const getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.find().sort({ createdAt: -1 })
    res.json({ success: true, flights })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching flights', error: error.message })
  }
}

// Get single flight by ID or Slug
export const getFlightById = async (req, res) => {
  try {
    const { id } = req.params;
    let flight;

    if (mongoose.Types.ObjectId.isValid(id)) {
      flight = await Flight.findById(id);
    } else {
      // Search in both slug (EN) and slug_fr (FR) — mirrors blog system
      flight = await Flight.findOne({
        $or: [
          { slug: id },
          { slug_fr: id }
        ]
      });
    }

    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' })
    }

    // Security Check: Allow admins/editors to see inactive flights
    const token = req.cookies?.jwt || req.headers.authorization?.split(' ')[1];
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

    // Hide inactive flights from public access
    if (flight.status === 'inactive' && !isAdmin) {
      return res.status(404).json({ message: 'Flight not found' })
    }

    // Fetch suggestions (3 other featured flights)
    const suggestedFlights = await Flight.find({
      _id: { $ne: flight._id },
      status: { $ne: 'inactive' },
      featured: true
    })
      .limit(3)
      .sort({ createdAt: -1 });

    // Build slugs object for language switching (mirrors blog's slugs:{en,fr})
    const slugs = {
      en: flight.slug,
      fr: flight.slug_fr || flight.slug  // fallback to EN slug if no FR slug
    };

    res.json({ success: true, flight, suggestedFlights, slugs })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching flight', error: error.message })
  }
}


// Helper: Ensure unique slug
const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };

    const slugExists = await Flight.findOne(query);
    if (!slugExists) break; // slug is unique, we're done

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// Helper: Validate JSON fields
const parseJSON = (field) => {
  try {
    return typeof field === 'string' ? JSON.parse(field) : field
  } catch (e) {
    return [] // Default to empty array on error for safety
  }
}

// Create new flight
export const createFlight = async (req, res) => {
  try {
    console.log('--- CreateFlight Debug ---');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Files:', req.files ? Object.keys(req.files) : 'NONE');

    if (!req.files || !req.files.mainImage) {
      console.error('CreateFlight Error: Main image is missing!');
      return res.status(400).json({ message: 'Main image is required' })
    }

    const mainImageUrl = await uploadToCloudinary(req.files.mainImage[0].buffer)

    let imageUrls = []
    if (req.files.images) {
      const uploadPromises = req.files.images.map(file => uploadToCloudinary(file.buffer))
      imageUrls = await Promise.all(uploadPromises)
    }

    // Slug: User input OR Autogenerated
    let initialSlug = req.body.slug && req.body.slug.trim() !== ''
      ? req.body.slug
      : slugify(req.body.title, { lower: true, strict: true });

    const finalSlug = await ensureUniqueSlug(initialSlug);

    // slug_fr: User input OR Auto-generated from title_fr
    const finalSlug_fr = req.body.slug_fr && req.body.slug_fr.trim() !== ''
      ? req.body.slug_fr
      : req.body.title_fr
        ? slugify(req.body.title_fr, { lower: true, strict: true })
        : finalSlug; // Fallback to EN slug

    const flightData = {
      ...req.body,
      slug: finalSlug,
      slug_fr: finalSlug_fr,
      mainImage: mainImageUrl,
      images: imageUrls,
      highlights: parseJSON(req.body.highlights) || [],
      included: parseJSON(req.body.included) || [],
      excluded: parseJSON(req.body.excluded) || [],
      highlights_fr: parseJSON(req.body.highlights_fr) || [],
      included_fr: parseJSON(req.body.included_fr) || [],
      excluded_fr: parseJSON(req.body.excluded_fr) || [],
      features: parseJSON(req.body.features) || [],
      program: parseJSON(req.body.program) || [],
      seasonalPricing: parseJSON(req.body.seasonalPricing) || [],
      tags: parseJSON(req.body.tags) || [],
      metaKeywords: parseJSON(req.body.metaKeywords) || [],
      metaKeywords_fr: parseJSON(req.body.metaKeywords_fr) || []
    }

    const newFlight = new Flight(flightData)
    await newFlight.save()

    res.status(201).json({ success: true, flight: newFlight })
  } catch (error) {
    console.error('Error creating flight:', error)
    res.status(500).json({ message: 'Error creating flight', error: error.message })
  }
}

// Update flight
export const updateFlight = async (req, res) => {
  try {
    const existingFlight = await Flight.findById(req.params.id)
    if (!existingFlight) {
      return res.status(404).json({ message: 'Flight not found' })
    }

    const updateData = { ...req.body }

    // Parse JSON fields safely
    const jsonFields = [
      'highlights', 'included', 'excluded',
      'highlights_fr', 'included_fr', 'excluded_fr',
      'features', 'program', 'seasonalPricing',
      'tags', 'metaKeywords', 'metaKeywords_fr'
    ]

    jsonFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = parseJSON(req.body[field]);
      }
    });

    // Handle existing images
    let currentImages = [];
    if (req.body.existingImages !== undefined) {
      try {
        currentImages = JSON.parse(req.body.existingImages);
        if (!Array.isArray(currentImages)) currentImages = [];
      } catch (e) {
        console.error('Error parsing existingImages', e);
        currentImages = existingFlight.images;
      }
    } else {
      currentImages = existingFlight.images;
    }

    // Handle Main Image Upload
    if (req.files?.mainImage?.[0]) {
      updateData.mainImage = await uploadToCloudinary(req.files.mainImage[0].buffer)
    }

    // Handle Additional Image Uploads
    if (req.files?.images?.length) {
      const uploadPromises = req.files.images.map(file => uploadToCloudinary(file.buffer))
      const newImages = await Promise.all(uploadPromises)
      // Merge: Base (Existing) + New
      updateData.images = [...currentImages, ...newImages]
    } else {
      updateData.images = currentImages;
    }

    // Handle Slug Update
    let targetSlug = existingFlight.slug;
    if (req.body.slug !== undefined) {
      if (req.body.slug.trim() !== '') {
        if (req.body.slug !== existingFlight.slug) {
          targetSlug = req.body.slug;
        }
      } else {
        // Empty slug sent -> Regenerate
        const titleToUse = req.body.title || existingFlight.title;
        targetSlug = slugify(titleToUse, { lower: true, strict: true });
      }
    }

    if (targetSlug !== existingFlight.slug) {
      updateData.slug = await ensureUniqueSlug(targetSlug, existingFlight._id);
    } else {
      delete updateData.slug;
    }

    const updatedFlight = await Flight.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )

    res.json({ success: true, flight: updatedFlight })
  } catch (error) {
    console.error('Error updating flight:', error)
    res.status(500).json({ message: 'Error updating flight', error: error.message })
  }
}

// Update flight status (Partial)
export const updateFlightStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { featured, status } = req.body; // Allow updating featured or status

    const updateData = {};
    if (featured !== undefined) updateData.featured = featured;
    if (status !== undefined) updateData.status = status;

    const updatedFlight = await Flight.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedFlight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    res.json({ success: true, flight: updatedFlight });
  } catch (error) {
    console.error('Error updating flight status:', error);
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
}

// Admin - delete flight
export const deleteFlight = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid flight ID' })
    }

    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });

    // Delete images from Cloudinary
    const extractPublicId = (url) => {
      if (!url) return null;
      try {
        const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i;
        const match = url.match(regex);
        return match ? match[1] : null;
      } catch (e) {
        console.error('Error extracting public id', e);
        return null;
      }
    };

    const imagesToDelete = [];
    if (flight.mainImage) imagesToDelete.push(flight.mainImage);
    if (flight.images && flight.images.length > 0) imagesToDelete.push(...flight.images);

    if (imagesToDelete.length > 0) {
      const publicIds = imagesToDelete.map(extractPublicId).filter(id => id !== null);

      if (publicIds.length > 0) {
        console.log('Deleting images from Cloudinary:', publicIds);
        const deletionPromises = publicIds.map(id => cloudinary.uploader.destroy(id));
        await Promise.allSettled(deletionPromises);
      }
    }

    await Flight.findByIdAndDelete(req.params.id);

    res.json({ message: 'Flight deleted successfully' })
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Failed to delete flight', error: error.message })
  }
}

// Add Review
export const addFlightReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid flight ID' });

    const name = req.body.name?.trim() || '';
    const avatar = req.body.avatar?.trim() || '';
    const comment = req.body.comment?.trim() || '';
    const rating = Number(req.body.rating);

    if (!name || rating < 1 || rating > 5 || !comment) {
      return res.status(400).json({ message: 'Invalid review data' });
    }

    const flight = await Flight.findById(id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });

    flight.reviews.push({ name, avatar, comment, rating });
    flight.rating = (flight.reviews.reduce((acc, r) => acc + r.rating, 0) / flight.reviews.length).toFixed(1);
    await flight.save();

    res.status(201).json({ success: true, review: flight.reviews[flight.reviews.length - 1] });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
}

// Delete Review
export const deleteFlightReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const flight = await Flight.findById(id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });

    flight.reviews = flight.reviews.filter(r => r._id.toString() !== reviewId);
    flight.rating = flight.reviews.length ? (flight.reviews.reduce((acc, r) => acc + r.rating, 0) / flight.reviews.length).toFixed(1) : 0;
    await flight.save();

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
}

export const migrateSlugs = async (req, res) => {
  try {
    const flights = await Flight.find({ slug: { $exists: false } });
    let count = 0;
    for (const flight of flights) {
      flight.slug = slugify(flight.title, { lower: true, strict: true });
      await flight.save();
      count++;
    }
    res.json({ success: true, migrated: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}