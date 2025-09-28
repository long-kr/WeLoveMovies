require("dotenv").config();

/**
 * Example usage of TMDb integration
 *
 * This file demonstrates how to use the TMDb API integration.
 * Make sure to set TMDB_API_KEY environment variable before running.
 */

const tmdbService = require("./tmdb.service");

async function testTMDbService() {
  try {
    console.log("Testing TMDb Service...\n");

    // Test API key configuration
    if (!process.env.TMDB_API_KEY) {
      console.log("❌ TMDB_API_KEY not configured");
      console.log("Please set your TMDb API key in environment variables:");
      console.log("export TMDB_API_KEY=your_api_key_here\n");
      return;
    }

    console.log("✅ TMDb API key configured\n");

    // Test getting popular movies
    console.log("Fetching popular movies...");
    const popularMovies = await tmdbService.getPopularMovies(1);
    console.log(`Found ${popularMovies.results.length} popular movies`);

    if (popularMovies.results.length > 0) {
      const firstMovie = popularMovies.results[0];
      console.log(`First movie: ${firstMovie.title}`);

      // Test movie transformation
      const movieDetails = await tmdbService.getMovieDetails(firstMovie.id);
      const transformedMovie = tmdbService.transformMovieData(movieDetails);

      console.log("\nTransformed movie data:");
      console.log(JSON.stringify(transformedMovie, null, 2));
    }

    console.log("\n✅ TMDb service test completed successfully!");
  } catch (error) {
    console.error("❌ Error testing TMDb service:", error.message);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testTMDbService();
}

module.exports = { testTMDbService };
