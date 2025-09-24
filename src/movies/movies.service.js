const knex = require("../db/connection");
const mapProperties = require("../utils/map-properties");

//list
function list () {
  return knex("movies")
    .select("*");
};

//list where movies are showing
function listShowing () {
  return knex("movies as m")
    .join("movies_theaters as mt", "m.movie_id", "mt.movie_id")
    .select("m.title", "m.movie_id", "mt.is_showing", "m.image_url" )
    .where({ "mt.is_showing": true})
    .groupBy("m.title", "m.movie_id", "mt.is_showing", "m.image_url");
};

//read a movies
function read(movieId) {
  return knex("movies")
    .select("*")
    .where({ "movie_id": movieId })
    .first();
};

//theaters have movie
function readMovieTheaters(movieId) {
  return knex("movies as m")
    .join("movies_theaters as mt", "m.movie_id", "mt.movie_id")
    .join("theaters as t", "mt.theater_id", "t.theater_id")
    .select("t.*", "mt.is_showing", "m.movie_id")
    .where({ "m.movie_id": movieId });
};

//reviews of movie
const addCritic = mapProperties({
  id: "critic.critic_id",
  pre: "critic.preferred_name",
  sur: "critic.surname",
  org: "critic.organization_name",
  cre: "critic.created_at",
  up: "critic.updated_at"
});

function readMovieReviews(movieId) {
  return knex("movies as m")
    .join("reviews as r", "m.movie_id", "r.movie_id")
    .join("critics as c", "r.critic_id", "c.critic_id")
    .select("r.*", "c.critic_id as id", "c.preferred_name as pre", "c.surname as sur", "c.organization_name as org", "c.created_at as cre", "c.updated_at as up")
    .where({"m.movie_id": movieId })
    .then((datas) => {
      let result = [];
      datas.forEach((data) => {
        result.push(addCritic(data));
      });
      return result;
    });
        
};

module.exports = {
  list,
  listShowing,
  read,
  readMovieTheaters,
  readMovieReviews,
};