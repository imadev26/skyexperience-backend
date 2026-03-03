import { Router } from 'express'
import { getDashboardOverview } from '../controllers/DashboardController.js'
import { verifyToken } from '../middlewares/AuthMiddleware.js'

const dashboardRoutes = Router()

dashboardRoutes.get('/overview', verifyToken, getDashboardOverview)

export default dashboardRoutes

