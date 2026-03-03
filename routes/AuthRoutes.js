import { Router } from 'express'
import { login, logout, createAdmin } from '../controllers/AuthController.js'
import { verifyToken, verifyAdmin } from '../middlewares/AuthMiddleware.js'

const authRoutes = Router()

authRoutes.post('/login', login)
authRoutes.post('/logout', logout)
// Only an authenticated admin can create another admin account
authRoutes.post('/admin', verifyToken, verifyAdmin, createAdmin)

export default authRoutes