import { Router } from 'express'
import { sendContactMessage } from '../controllers/ContactController.js'

const contactRoutes = Router()

// Public route
contactRoutes.post('/', sendContactMessage)

export default contactRoutes
