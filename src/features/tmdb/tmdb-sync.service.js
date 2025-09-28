const knex = require("../../db/connection");
const tmdbService = require("./tmdb.service");
const { cache } = require("../../lib/cache");

class TMDbSyncService {
  /**
   * Sync movies from TMDb to local database
   * @param {string} listType - Type of list to sync (popular, now_playing, top_rated, upcoming)
   * @param {number} pages - Number of pages to sync (default: 1)
   * @returns {Promise<Object>} - Sync results
   */
  async syncMovies(listType = "popular", pages = 1) {
    const results = {
      total: 0,
      inserted: 0,
      skipped: 0,
      errors: 0,
      errorDetails: /** @type {Array<{movie: string, tmdb_id: number, error: string}>} */ ([]),
    };

    try {
      // Validate list type
      const validListTypes = ["popular", "now_playing", "top_rated", "upcoming"];
      if (!validListTypes.includes(listType)) {
        throw new Error(`Invalid list type. Must be one of: ${validListTypes.join(", ")}`);
      }

      // Get method name based on list type
      const methodMap = {
        popular: "getPopularMovies",
        now_playing: "getNowPlayingMovies",
        top_rated: "getTopRatedMovies",
        upcoming: "getUpcomingMovies",
      };

      const method = methodMap[listType];

      // Fetch movies from TMDb for specified pages
      for (let page = 1; page <= pages; page++) {
        // eslint-disable-next-line no-console
        console.log(`Fetching ${listType} movies - Page ${page}/${pages}`);

        const tmdbResponse = await tmdbService[method](page);
        const movies = tmdbResponse.results || [];

        results.total += movies.length;

        // Process each movie
        for (const tmdbMovie of movies) {
          try {
            // Get detailed movie information
            const movieDetails = await tmdbService.getMovieDetails(tmdbMovie.id);

            // Check if movie already exists
            const existingMovie = await this.findMovieByTmdbId(tmdbMovie.id);

            if (existingMovie) {
              // eslint-disable-next-line no-console
              console.log(`Movie already exists: ${tmdbMovie.title} (TMDb ID: ${tmdbMovie.id})`);
              results.skipped++;
              continue;
            }

            // Transform and insert movie
            const movieData = tmdbService.transformMovieData(movieDetails);
            const insertedMovie = await this.insertMovie(movieData);

            // eslint-disable-next-line no-console
            console.log(`Inserted movie: ${movieData.title} (ID: ${insertedMovie.movie_id})`);
            results.inserted++;

            // Add small delay to avoid rate limiting
            await this.delay(100);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Error processing movie ${tmdbMovie.title}:`, error.message);
            results.errors++;
            results.errorDetails.push({
              movie: tmdbMovie.title || "Unknown",
              tmdb_id: tmdbMovie.id || 0,
              error: error.message || "Unknown error",
            });
          }
        }
      }

      // Clear cache after sync
      this.clearMoviesCache();

      // eslint-disable-next-line no-console
      console.log(
        `Sync completed. Total: ${results.total}, Inserted: ${results.inserted}, Skipped: ${results.skipped}, Errors: ${results.errors}`
      );

      return results;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error during movie sync:", error.message);
      throw error;
    }
  }

  /**
   * Find movie by TMDb ID
   * @param {number} tmdbId - TMDb movie ID
   * @returns {Promise<Object|null>} - Movie record or null
   */
  async findMovieByTmdbId(tmdbId) {
    return knex("movies").select("*").where({ tmdb_id: tmdbId }).first();
  }

  /**
   * Insert new movie into database
   * @param {Object} movieData - Movie data to insert
   * @returns {Promise<Object>} - Inserted movie record
   */
  async insertMovie(movieData) {
    const [insertedMovie] = await knex("movies").insert(movieData).returning("*");

    return insertedMovie;
  }

  /**
   * Update existing movie with TMDb data
   * @param {number} movieId - Local movie ID
   * @param {Object} movieData - Updated movie data
   * @returns {Promise<Object>} - Updated movie record
   */
  async updateMovie(movieId, movieData) {
    const [updatedMovie] = await knex("movies")
      .where({ movie_id: movieId })
      .update({
        ...movieData,
        updated_at: knex.fn.now(),
      })
      .returning("*");

    return updatedMovie;
  }

  /**
   * Sync specific movie by TMDb ID
   * @param {number} tmdbId - TMDb movie ID
   * @param {boolean} forceUpdate - Whether to update if movie exists
   * @returns {Promise<Object>} - Sync result
   */
  async syncMovieById(tmdbId, forceUpdate = false) {
    try {
      // Get movie details from TMDb
      const movieDetails = await tmdbService.getMovieDetails(tmdbId);

      // Check if movie already exists
      const existingMovie = await this.findMovieByTmdbId(tmdbId);

      if (existingMovie && !forceUpdate) {
        return {
          action: "skipped",
          movie: existingMovie,
          message: "Movie already exists",
        };
      }

      // Transform movie data
      const movieData = tmdbService.transformMovieData(movieDetails);

      let result;
      if (existingMovie && forceUpdate) {
        // Update existing movie
        result = await this.updateMovie(existingMovie.movie_id, movieData);
        this.clearMoviesCache();

        return {
          action: "updated",
          movie: result,
          message: "Movie updated successfully",
        };
      } else {
        // Insert new movie
        result = await this.insertMovie(movieData);
        this.clearMoviesCache();

        return {
          action: "inserted",
          movie: result,
          message: "Movie inserted successfully",
        };
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error syncing movie with TMDb ID ${tmdbId}:`, error.message);
      throw error;
    }
  }

  /**
   * Search and sync movies by title
   * @param {string} query - Search query
   * @param {number} maxResults - Maximum number of results to process
   * @returns {Promise<Object>} - Sync results
   */
  async searchAndSyncMovies(query, maxResults = 10) {
    const results = {
      total: 0,
      inserted: 0,
      skipped: 0,
      errors: 0,
      errorDetails: /** @type {Array<{movie: string, tmdb_id: number, error: string}>} */ ([]),
    };

    try {
      // Search movies on TMDb
      const searchResponse = await tmdbService.searchMovies(query);
      const movies = searchResponse.results.slice(0, maxResults);

      results.total = movies.length;

      // Process each movie
      for (const tmdbMovie of movies) {
        try {
          const syncResult = await this.syncMovieById(tmdbMovie.id);

          if (syncResult.action === "inserted") {
            results.inserted++;
          } else {
            results.skipped++;
          }

          // Add small delay
          await this.delay(100);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Error processing search result ${tmdbMovie.title}:`, error.message);
          results.errors++;
          results.errorDetails.push({
            movie: tmdbMovie.title || "Unknown",
            tmdb_id: tmdbMovie.id || 0,
            error: error.message || "Unknown error",
          });
        }
      }

      return results;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error during search and sync:", error.message);
      throw error;
    }
  }

  /**
   * Get sync statistics
   * @returns {Promise<Object>} - Sync statistics
   */
  async getSyncStats() {
    const [totalMovies] = await knex("movies").count("movie_id as count");
    const [tmdbMovies] = await knex("movies").where({ source: "tmdb" }).count("movie_id as count");
    const [manualMovies] = await knex("movies")
      .where({ source: "manual" })
      .count("movie_id as count");

    return {
      totalMovies: parseInt(totalMovies.count, 10),
      tmdbMovies: parseInt(tmdbMovies.count, 10),
      manualMovies: parseInt(manualMovies.count, 10),
      lastSync: await this.getLastSyncTime(),
    };
  }

  /**
   * Get last sync time from cache or database
   * @returns {Promise<string|null>} - Last sync timestamp
   */
  async getLastSyncTime() {
    // This could be enhanced to store sync history in database
    return cache.get("tmdb:last_sync") || null;
  }

  /**
   * Set last sync time
   * @param {string} timestamp - Sync timestamp
   */
  setLastSyncTime(timestamp = new Date().toISOString()) {
    cache.set("tmdb:last_sync", timestamp, 86400000); // 24 hours
  }

  /**
   * Clear movies-related cache
   */
  clearMoviesCache() {
    // Clear all movie-related cache entries using pattern matching
    cache.deletePattern("movies:*");
  }

  /**
   * Add delay for rate limiting
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise((resolve) => global.setTimeout(resolve, ms));
  }
}

module.exports = new TMDbSyncService();
