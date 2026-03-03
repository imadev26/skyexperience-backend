import Review from '../models/Review.js';

import Flight from '../models/Flight.js';

// Get all reviews (public + admin filters)
export const getReviews = async (req, res) => {
    try {
        const { status, limit, showOnHome, flightId, flightTitle } = req.query;
        let query = {};

        if (status) query.status = status;
        if (showOnHome === 'true') query.showOnHome = true;
        if (flightId) query.flightId = flightId;

        // Support filtering by Flight Title (for frontend integration)
        if (flightTitle) {
            const flight = await Flight.findOne({ title: flightTitle });
            if (flight) {
                query.flightId = flight._id;
            } else {
                // If flight not found by title, return empty or handle as needed
                // For now, if title doesn't match DB, we probably return nothing for that flight
                return res.status(200).json([]);
            }
        }

        let reviewsQuery = Review.find(query).sort({ createdAt: -1 }).populate('flightId', 'title');

        if (limit) {
            reviewsQuery = reviewsQuery.limit(parseInt(limit));
        }

        const reviews = await reviewsQuery;
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a review (Public)
export const createReview = async (req, res) => {
    try {
        const newReview = new Review(req.body);
        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update review status (Admin)
export const updateReviewStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedReview = await Review.findByIdAndUpdate(
            id,
            req.body, // Allow updating any field (status, showOnHome, flightId)
            { new: true }
        );

        if (!updatedReview) return res.status(404).json({ message: 'Review not found' });

        res.status(200).json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete review (Admin)
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        await Review.findByIdAndDelete(id);
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
