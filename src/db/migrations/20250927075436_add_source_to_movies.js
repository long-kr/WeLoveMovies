/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("movies", (table) => {
    table.string("source").defaultTo("manual"); // Track data source (manual, tmdb, etc.)
    table.integer("tmdb_id").nullable(); // Store TMDb ID for duplicate prevention
    table.index("tmdb_id"); // Index for faster lookups
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("movies", (table) => {
    table.dropColumn("source");
    table.dropColumn("tmdb_id");
  });
};
