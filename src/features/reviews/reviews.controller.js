const service = require("./reviews.service");
const { asyncErrorBoundary, createValidationMiddleware, schemas } = require("../../middleware");
const { NotFoundError, ValidationError } = require("../../middleware/errors/CustomError");

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
    asyncErrorBoundary(hasReview),
    createValidationMiddleware(schemas.reviewUpdate),
    asyncErrorBoundary(update),
  ],
};
