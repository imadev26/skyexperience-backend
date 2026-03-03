import { Router } from 'express'
import {
  createFlight,
  getAllFlights,
  getFlightById,
  updateFlight,
  deleteFlight,
  uploadFlightImages,
  addFlightReview,
  deleteFlightReview,
  migrateSlugs,
  updateFlightStatus
} from '../controllers/FlightController.js'
import { verifyToken } from '../middlewares/AuthMiddleware.js'

const flightRoutes = Router()

// Public route
flightRoutes.get('/migrate-slugs', migrateSlugs)
flightRoutes.get('/', getAllFlights)
flightRoutes.get('/:id', getFlightById)

// Debug Wrapper for Multer
const debugUpload = (req, res, next) => {
  console.log('--- Route: POST /api/flights hit ---');
  console.log('Headers:', req.headers);
  uploadFlightImages(req, res, (err) => {
    if (err) {
      console.error('Multer Error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large (Max 5MB)' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Unexpected field in form data' });
      }
      return res.status(400).json({ message: err.message });
    }
    console.log('Multer Success. Files:', req.files ? Object.keys(req.files) : 'None');
    next();
  });
};

// Admin only
flightRoutes.post('/', verifyToken, debugUpload, createFlight)
flightRoutes.put('/:id', verifyToken, debugUpload, updateFlight)
flightRoutes.patch('/:id/status', verifyToken, updateFlightStatus)
flightRoutes.delete('/:id', verifyToken, deleteFlight)
flightRoutes.post('/:id/reviews', verifyToken, addFlightReview)
flightRoutes.delete('/:id/reviews/:reviewId', verifyToken, deleteFlightReview)

export default flightRoutes

