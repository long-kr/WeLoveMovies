const knex = require("../db/connection");
const mapProperties = require("../utils/map-properties");
const reduceProperties = require("../utils/reduce-properties");

const reduceMovies = reduceProperties("theater_id", {
  "id": ["movies", null, "movie_id"],
  "titl": ["movies", null, "title"],
  "run": ["movies", null, "runtime_in_minutes"],
  "rat": ["movies", null, "rating"],
  "des": ["movies", null, "description"],
  "im": ["movies", null, "image_url"],
  "cre": ["movies", null, "created_at"],
  "up": ["movies", null, "updated_at"],
  "is": ["movies", null, "is_showing"],
  "th": ["movies", null, "theater_id"],
});

function list () {
  return knex("theaters as t")
    .join("movies_theaters as mt", "t.theater_id", "mt.theater_id")
    .join("movies as m", "mt.movie_id", "m.movie_id")
    .select("t.*",
      "m.movie_id as id", 
      "m.title as titl", 
      "m.runtime_in_minutes as run", 
      "m.rating as rat", 
      "m.description as des", 
      "m.image_url as im",
      "m.created_at as cre", 
      "m.updated_at as up", 
      "mt.is_showing as is",
      "mt.theater_id as th")
    .where({ "mt.is_showing" : true })
    .then(reduceMovies);
};

module.exports = {
  list,
};