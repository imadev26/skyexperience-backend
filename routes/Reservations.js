import { Router } from 'express'
import {
  createReservation,
  getAllReservations,
  getReservationById,
  deleteReservation,
  updateReservationStatus,
} from '../controllers/ReservationController.js'
import { verifyToken } from '../middlewares/AuthMiddleware.js'

const reservationRoutes = Router()

// Public
reservationRoutes.post('/', createReservation)

// Admin only
reservationRoutes.get('/', verifyToken, getAllReservations)
reservationRoutes.get('/:id', verifyToken, getReservationById)
reservationRoutes.delete('/:id', verifyToken, deleteReservation)
reservationRoutes.patch('/:id/status', verifyToken, updateReservationStatus)


export default reservationRoutes
