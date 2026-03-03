import { Router } from 'express';
import {
    getPosts,
    getPostBySlug,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    uploadBlogImages
} from '../controllers/BlogPostController.js';
import { verifyToken, verifyTokenOptional } from '../middlewares/AuthMiddleware.js';

const router = Router();

// Public routes (Optional Auth for Admin Access)
router.get('/', verifyTokenOptional, getPosts);
router.get('/id/:id', getPostById); // For Admin to fetch raw object
router.get('/:slug', verifyTokenOptional, getPostBySlug);

// Admin/Editor routes
router.post('/', verifyToken, uploadBlogImages, createPost);
router.put('/:id', verifyToken, uploadBlogImages, updatePost);
router.delete('/:id', verifyToken, deletePost);

export default router;
