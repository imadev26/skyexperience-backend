import mongoose from 'mongoose'

const reservationSchema = new mongoose.Schema({
  date: { type: Date, required: true },                // Reservation date (flight date or booking date)
  travelers: { type: Number, required: true },          // Number of travelers
  total: { type: Number, required: true },              // Total price
  fullName: { type: String, required: true },           // Customer full name
  email: { type: String, required: true },              // Customer email
  phoneNumber: { type: String },                        // Phone number (optional)
  pickUpLocation: { type: String, required: true },     // Pick up location
  flight: {                                             // Reference to Flight
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true })                                // Adds createdAt and updatedAt automatically

export default mongoose.model('Reservation', reservationSchema)

