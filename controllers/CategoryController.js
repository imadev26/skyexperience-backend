import Category from '../models/Category.js';

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: 1 });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create category
export const createCategory = async (req, res) => {
    try {
        const { en, fr } = req.body;
        if (!en || !fr) {
            return res.status(400).json({ message: 'Both English and French labels are required.' });
        }

        // Generate value key from English label (e.g., "Latest News" -> "LATEST_NEWS")
        const value = en.toUpperCase().replace(/\s+/g, '_');

        const existingCookie = await Category.findOne({ value });
        if (existingCookie) {
            return res.status(400).json({ message: 'Category already exists.' });
        }

        const newCategory = new Category({
            label: { en, fr },
            value
        });

        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.findByIdAndDelete(id);
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
