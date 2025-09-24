const service = require("./reviews.service");
const asyncError = require("../error/asyncErrorBoundary");
const { NotFoundError, ValidationError, DatabaseError } = require('../error/CustomError');
const { createValidationMiddleware, schemas } = require('../utils/validation');

/**
 * Middleware to check if review exists
 */
async function hasReview(req, res, next) {
    const { reviewId } = req.params;
    
    if (!reviewId) {
        throw new ValidationError('ReviewId is required');
    }

    try {
        const review = await service.read(reviewId);
        if (!review) {
            throw new NotFoundError('Review cannot be found');
        }
        res.locals.review = review;
        return next();
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new DatabaseError('Error checking review existence');
    }
}

/**
 * Update a review
 */
async function update(req, res) {
    try {
        const updatedReview = {
            ...req.body.data,
            review_id: res.locals.review.review_id,
        };
        
        await service.update(updatedReview);
        const data = await service.returnUpdate(res.locals.review.review_id);
        res.json({ data });
    } catch (error) {
        throw new DatabaseError('Failed to update review');
    }
}



module.exports = {
    update: [
        asyncError(hasReview),
        createValidationMiddleware(schemas.reviewUpdate),
        asyncError(update)
    ],
  
};