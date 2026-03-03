import { Router } from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/CategoryController.js';
import { verifyToken } from '../middlewares/AuthMiddleware.js';

const router = Router();

// Public - fetch categories for frontend translation
router.get('/', getCategories);

// Admin - manage categories
router.post('/', verifyToken, createCategory);
router.delete('/:id', verifyToken, deleteCategory);

export default router;
