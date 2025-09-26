const knex = require("../db/connection");
const mapProperties = require("../utils/map-properties");
const cache = require("../utils/cache");

function read(review_id) {
  const cacheKey = cache.generateKey("reviews:read", { review_id });

  // Try to get from cache first
  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    return Promise.resolve(cachedResult);
  }

  return knex("reviews")
    .select("*")
    .where({ review_id })
    .first()
    .then((review) => {
      if (review) {
        // Cache the result for 5 minutes
        cache.set(cacheKey, review, 300000);
      }
      return review;
    });
}

const addCritic = mapProperties({
  id: "critic.critic_id",
  pr: "critic.preferred_name",
  su: "critic.surname",
  or: "critic.organization_name",
  cr: "critic.created_at",
  up: "critic.updated_at",
});

function returnUpdate(reviewId) {
  const cacheKey = cache.generateKey("reviews:update", { reviewId });

  // Try to get from cache first
  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    return Promise.resolve(cachedResult);
  }

  return knex("reviews as r")
    .join("critics as c", "r.critic_id", "c.critic_id")
    .select(
      "r.*",
      "c.critic_id as id",
      "c.preferred_name as pr",
      "c.surname as su",
      "c.organization_name as or",
      "c.created_at as cr",
      "c.updated_at as up"
    )
    .where({ "r.review_id": reviewId })
    .first()
    .then(addCritic)
    .then((review) => {
      if (review) {
        // Cache the result for 5 minutes
        cache.set(cacheKey, review, 300000);
      }
      return review;
    });
}

function update(updatedReview) {
  return knex("reviews")
    .select("*")
    .where({ review_id: updatedReview.review_id })
    .update(updatedReview, "*")
    .then((updatedRecords) => {
      const updatedRecord = updatedRecords[0];

      if (updatedRecord) {
        // Invalidate cache for this review
        const reviewCacheKey = cache.generateKey("reviews:read", {
          review_id: updatedReview.review_id,
        });
        const updateCacheKey = cache.generateKey("reviews:update", {
          reviewId: updatedReview.review_id,
        });

        cache.delete(reviewCacheKey);
        cache.delete(updateCacheKey);

        // Also invalidate movie reviews cache if this review is associated with a movie
        if (updatedRecord.movie_id) {
          cache.deletePattern(`movies:reviews:movieId:${updatedRecord.movie_id}*`);
        }
      }

      return updatedRecord;
    });
}

module.exports = {
  read,
  update,
  returnUpdate,
};
