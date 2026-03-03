import { Router } from 'express';
import {
    getReviews,
    createReview,
    updateReviewStatus,
    deleteReview
} from '../controllers/ReviewController.js';
import { verifyToken } from '../middlewares/AuthMiddleware.js';

const router = Router();

// Public routes
router.get('/', getReviews);
router.post('/', createReview);

// Admin routes
router.patch('/:id/status', verifyToken, updateReviewStatus);
router.delete('/:id', verifyToken, deleteReview);

export default router;
