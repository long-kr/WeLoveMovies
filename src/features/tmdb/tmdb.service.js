const axios = require("axios");
const config = require("../../config");

class TMDbService {
  constructor() {
    this.baseURL = config.apis.tmdb.baseURL;
    this.apiKey = config.apis.tmdb.apiKey;
    this.imageBaseURL = config.apis.tmdb.imageBaseURL;

    if (!this.apiKey) {
      // eslint-disable-next-line no-console
      console.warn("TMDb API key not found. Please set TMDB_API_KEY environment variable.");
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      params: {
        api_key: this.apiKey,
      },
      timeout: config.apis.tmdb.timeout,
    });
  }

  /**
   * Get popular movies from TMDb
   * @param {number} page - Page number (default: 1)
   * @returns {Promise<Object>} - TMDb API response
   */
  async getPopularMovies(page = 1) {
    try {
      const response = await this.client.get("/movie/popular", {
        params: { page },
      });
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching popular movies from TMDb:", error.message);
      throw new Error(`Failed to fetch popular movies: ${error.message}`);
    }
  }

  /**
   * Get now playing movies from TMDb
   * @param {number} page - Page number (default: 1)
   * @returns {Promise<Object>} - TMDb API response
   */
  async getNowPlayingMovies(page = 1) {
    try {
      const response = await this.client.get("/movie/now_playing", {
        params: { page },
      });
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching now playing movies from TMDb:", error.message);
      throw new Error(`Failed to fetch now playing movies: ${error.message}`);
    }
  }

  /**
   * Get top rated movies from TMDb
   * @param {number} page - Page number (default: 1)
   * @returns {Promise<Object>} - TMDb API response
   */
  async getTopRatedMovies(page = 1) {
    try {
      const response = await this.client.get("/movie/top_rated", {
        params: { page },
      });
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching top rated movies from TMDb:", error.message);
      throw new Error(`Failed to fetch top rated movies: ${error.message}`);
    }
  }

  /**
   * Get upcoming movies from TMDb
   * @param {number} page - Page number (default: 1)
   * @returns {Promise<Object>} - TMDb API response
   */
  async getUpcomingMovies(page = 1) {
    try {
      const response = await this.client.get("/movie/upcoming", {
        params: { page },
      });
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching upcoming movies from TMDb:", error.message);
      throw new Error(`Failed to fetch upcoming movies: ${error.message}`);
    }
  }

  /**
   * Get movie details by TMDb ID
   * @param {number} movieId - TMDb movie ID
   * @returns {Promise<Object>} - Movie details
   */
  async getMovieDetails(movieId) {
    try {
      const response = await this.client.get(`/movie/${movieId}`);
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error fetching movie details for ID ${movieId}:`, error.message);
      throw new Error(`Failed to fetch movie details: ${error.message}`);
    }
  }

  /**
   * Search movies by query
   * @param {string} query - Search query
   * @param {number} page - Page number (default: 1)
   * @returns {Promise<Object>} - Search results
   */
  async searchMovies(query, page = 1) {
    try {
      const response = await this.client.get("/search/movie", {
        params: {
          query,
          page,
        },
      });
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error searching movies with query "${query}":`, error.message);
      throw new Error(`Failed to search movies: ${error.message}`);
    }
  }

  /**
   * Transform TMDb movie data to match local database schema
   * @param {Object} tmdbMovie - Movie data from TMDb API
   * @returns {Object} - Transformed movie data
   */
  transformMovieData(tmdbMovie) {
    return {
      title: tmdbMovie.title,
      runtime_in_minutes: tmdbMovie.runtime || null,
      rating: this.mapRating(tmdbMovie.adult, tmdbMovie.vote_average),
      description: tmdbMovie.overview,
      image_url: tmdbMovie.poster_path ? `${this.imageBaseURL}${tmdbMovie.poster_path}` : null,
      source: "tmdb",
      tmdb_id: tmdbMovie.id,
    };
  }

  /**
   * Map TMDb rating system to local rating system
   * @param {boolean} adult - Whether the movie is adult content
   * @param {number} voteAverage - TMDb vote average
   * @returns {string} - Mapped rating
   */
  mapRating(adult, voteAverage) {
    if (adult) return "R";

    // Map based on vote average (0-10 scale)
    if (voteAverage >= 8.5) return "PG";
    if (voteAverage >= 7.0) return "PG-13";
    if (voteAverage >= 5.0) return "PG-13";
    return "PG";
  }

  /**
   * Get full image URL from poster path
   * @param {string} posterPath - Poster path from TMDb
   * @param {string} size - Image size (default: w500)
   * @returns {string} - Full image URL
   */
  getImageURL(posterPath, size = "w500") {
    if (!posterPath) return "";
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  }
}

module.exports = new TMDbService();
