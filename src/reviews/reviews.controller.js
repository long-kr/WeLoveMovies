const service = require("./reviews.service");
const asyncError = require("../error/asyncErrorBoundary");
const { NotFoundError, ValidationError } = require("../error/CustomError");
const { createValidationMiddleware, schemas } = require("../utils/validation");

/**
 * Middleware to check if review exists
 */
async function hasReview(req, res, next) {
  const { reviewId } = req.params;

  if (!reviewId) throw new ValidationError("ReviewId is required");

  const review = await service.read(reviewId);

  if (!review) throw new NotFoundError("Review cannot be found");

  res.locals.review = review;
  return next();
}

/**
 * Update a review
 */
async function update(req, res) {
  const updatedReview = {
    ...req.body.data,
    review_id: res.locals.review.review_id,
  };

  await service.update(updatedReview);
  const data = await service.returnUpdate(res.locals.review.review_id);
  res.json({ data });
}

module.exports = {
  update: [
    asyncError(hasReview),
    createValidationMiddleware(schemas.reviewUpdate),
    asyncError(update),
  ],
};
