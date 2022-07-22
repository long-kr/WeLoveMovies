const { where } = require("../db/connection");
const knex = require("../db/connection");
const mapProperties = require("../utils/map-properties");

function read(review_id) {
    return knex("reviews")
        .select("*")
        .where({ review_id })
        .first();
};

const addCritic = mapProperties({
    id: "critic.critic_id",
    pr: "critic.preferred_name",
    su: "critic.surname",
    or: "critic.organization_name",
    cr: "critic.created_at",
    up: "critic.updated_at"
});

function returnUpdate(reviewId) {
    return knex("reviews as r")
    .join("critics as c", "r.critic_id", "c.critic_id")
    .select("r.*",
        "c.critic_id as id",
        "c.preferred_name as pr",
        "c.surname as su",
        "c.organization_name as or",
        "c.created_at as cr",
        "c.updated_at as up")
    .where({ "r.review_id" : reviewId })
    .first()
    .then(addCritic)
};

function update(updatedReview) {
    return knex("reviews")
        .select("*")
        .where({ "review_id": updatedReview.review_id })
        .update(updatedReview, "*")
        .then((updatedRecords) => updatedRecords[0]);
};

function destroy(review_id) {
    return knex("reviews")
        .where({ review_id })
        .del()
};

module.exports = {
    read,
    update,
    returnUpdate,
    destroy
}