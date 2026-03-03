import Reservation from '../models/Reservation.js'
import mongoose from 'mongoose'
import Flight from '../models/Flight.js'

const RESERVATION_STATUSES = ['pending', 'confirmed', 'cancelled']

// Validate reservation data
const validateReservationData = (data) => {
  const errors = []
  
  // Date validation
  const parsedDate = new Date(data.date)
  if (!data.date || Number.isNaN(parsedDate.getTime())) {
    errors.push('Valid date is required')
  } else {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const reservationDay = new Date(parsedDate)
    reservationDay.setHours(0, 0, 0, 0)

    if (reservationDay < today) {
      errors.push('Reservation date cannot be in the past')
    }
  }

  // Travelers validation
  if (!data.travelers || typeof data.travelers !== 'number' || data.travelers < 1 || data.travelers > 20) {
    errors.push('Number of travelers must be between 1 and 20')
  }

  // Total price validation
  if (!data.total || typeof data.total !== 'number' || data.total <= 0) {
    errors.push('Valid total price is required and must be greater than 0')
  }

  // Full name validation
  if (!data.fullName || typeof data.fullName !== 'string' || data.fullName.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters')
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Valid email is required')
  }

  // Phone number validation (optional)
  if (data.phoneNumber && typeof data.phoneNumber !== 'string') {
    errors.push('Phone number must be a string if provided')
  }

  // Pickup location validation
  if (!data.pickUpLocation || typeof data.pickUpLocation !== 'string' || data.pickUpLocation.trim().length < 3) {
    errors.push('Pickup location is required and must be at least 3 characters')
  }

  // Flight ID validation
  if (!data.flight || !mongoose.Types.ObjectId.isValid(data.flight)) {
    errors.push('Valid flight reference is required')
  }

  // Status validation (optional)
  if (data.status && !RESERVATION_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${RESERVATION_STATUSES.join(', ')}`)
  }

  return errors.length > 0 ? errors : null
}

// Create a new reservation (Public)
export const createReservation = async (req, res) => {
  try {
    console.log('Received reservation data:', req.body);
    
    const normalizedPayload = {
      ...req.body,
      travelers: Number(req.body.travelers),
      total: Number(req.body.total)
    }

    console.log('Normalized payload:', normalizedPayload);

    // Validate input data
    const validationErrors = validateReservationData(normalizedPayload)
    if (validationErrors) {
      console.log('Validation errors:', validationErrors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      })
    }

    // Verify flight exists
    const flightExists = await Flight.exists({ _id: normalizedPayload.flight })
    if (!flightExists) {
      return res.status(400).json({ message: 'Referenced flight does not exist' })
    }

    // Prepare reservation data
    const reservationData = {
      date: new Date(normalizedPayload.date),
      travelers: normalizedPayload.travelers,
      total: normalizedPayload.total,
      fullName: normalizedPayload.fullName.trim(),
      email: normalizedPayload.email.trim().toLowerCase(),
      phoneNumber: normalizedPayload.phoneNumber && normalizedPayload.phoneNumber.trim() 
        ? normalizedPayload.phoneNumber.trim() 
        : undefined,
      pickUpLocation: normalizedPayload.pickUpLocation.trim(),
      flight: normalizedPayload.flight,
      status: normalizedPayload.status && RESERVATION_STATUSES.includes(normalizedPayload.status)
        ? normalizedPayload.status
        : 'pending'
    }
    
    console.log('Prepared reservation data:', reservationData);

    // Create reservation
    const reservation = await Reservation.create(reservationData)
    await reservation.populate('flight', 'title price mainImage category rating')
    
    // Return response without internal fields
    res.status(201).json(reservation)
  } catch (error) {
    res.status(400).json({ 
      message: 'Failed to create reservation', 
      error: error.message 
    })
  }
}

// Get all reservations (Admin)
export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('flight', 'title price mainImage category rating') // Only include necessary flight fields
      .select('-__v -updatedAt') // Exclude unnecessary fields
      .sort({ createdAt: -1 }) // Newest first
    
    res.json(reservations)
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get reservations', 
      error: error.message 
    })
  }
}

// Get one reservation by ID (Admin)
export const getReservationById = async (req, res) => {
  try {
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid reservation ID' })
    }

    const reservation = await Reservation.findById(req.params.id)
      .populate('flight', 'title price mainImage category rating') // Include needed flight fields
      .select('-__v -updatedAt') // Exclude unnecessary fields

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' })
    }
    
    res.json(reservation)
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get reservation', 
      error: error.message 
    })
  }
}

// Delete a reservation by ID (Admin)
export const deleteReservation = async (req, res) => {
  try {
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid reservation ID' })
    }

    const deleted = await Reservation.findByIdAndDelete(req.params.id)
    if (!deleted) {
      return res.status(404).json({ message: 'Reservation not found' })
    }
    
    res.json({ 
      message: 'Reservation deleted successfully',
      deletedId: deleted._id
    })
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to delete reservation', 
      error: error.message 
    })
  }
}

// Update reservation status (Admin)
export const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid reservation ID' })
    }

    const { status } = req.body
    if (!status || !RESERVATION_STATUSES.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status value',
        allowedStatuses: RESERVATION_STATUSES
      })
    }

    const reservation = await Reservation.findById(id)
      .populate('flight', 'title price mainImage category rating')
      .select('-__v -updatedAt')

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' })
    }

    reservation.status = status
    await reservation.save()

    res.json({
      message: 'Reservation status updated successfully',
      success: true,
      reservation
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update reservation status',
      error: error.message
    })
  }
}