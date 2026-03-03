import mongoose from 'mongoose';

const featureSchema = new mongoose.Schema({
  icon: { type: String, required: true },
  title: { type: String },
  title_fr: { type: String },
  description: { type: String },
  description_fr: { type: String }
});

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatar: { type: String },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }
}, { timestamps: true });

const seasonalPricingSchema = new mongoose.Schema({
  season: String,
  startDate: Date,
  endDate: Date,
  price: Number
});

const flightSchema = new mongoose.Schema({
  // Core Identifiers
  slug: { type: String, required: true, unique: true },
  slug_fr: { type: String }, // Optional French slug

  // Basic Info (Localized)
  title: { type: String, required: true },
  title_fr: String,
  overview: { type: String, required: true },
  overview_fr: String,

  // Pricing
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  seasonalPricing: [seasonalPricingSchema],

  // Media
  mainImage: { type: String, required: true }, // e.g., '/images/flight-main.jpg'
  images: [String], // Gallery images

  // Location & Duration
  location: { type: String, default: 'Ouled El Garne, Bourouss, Morocco' },
  destination: { type: String, default: 'Marrakech' },
  duration: { type: String, default: '1 day' },

  // Capacity
  minPeople: { type: Number, default: 2 },
  maxPeople: { type: Number, default: 16 },
  minAge: { type: Number, default: 4 },
  maxCapacityPerDay: Number,

  // Classification
  tourType: { type: String, required: true }, // e.g., 'Royal Flight', 'Classic Flight'
  difficulty: { type: String, enum: ['easy', 'moderate', 'challenging'], default: 'easy' },
  tags: [String], // e.g., ['luxury', 'romantic']
  category: {
    type: String,
    enum: ['vip', 'romantic offer', 'most reserved', 'standard', 'classic'],
    default: 'standard'
  },

  // Content Lists (Localized)
  highlights: [String],
  highlights_fr: [String],
  included: [String],
  included_fr: [String],
  excluded: [String],
  excluded_fr: [String],

  // Features (Icon + Title + Desc)
  features: [featureSchema],

  // Itinerary / Program
  program: [{
    time: String,
    title: { type: String, required: true },
    title_fr: String,
    description: String,
    description_fr: String
  }],

  // Policies
  cancellationPolicy: {
    fullRefund: Number, // days before
    partialRefund: Number, // days before
    noRefund: Number, // days before
    refundPercentage: {
      full: Number,
      partial: Number
    }
  },
  weatherPolicy: String,
  requirements: {
    maxWeight: Number,
    healthRestrictions: [String],
    pregnancyAllowed: Boolean,
    mobilityRequired: String
  },

  // Reviews
  reviews: [reviewSchema],

  // Metrics
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },

  // Status
  status: { type: String, enum: ['active', 'inactive', 'seasonal'], default: 'active' },
  featured: { type: Boolean, default: false },
  popular: { type: Boolean, default: false },

  // SEO
  metaDescription: String,
  metaDescription_fr: String,
  metaKeywords: [String],
  metaKeywords_fr: [String]

}, { timestamps: true });

export default mongoose.model('Flight', flightSchema);
