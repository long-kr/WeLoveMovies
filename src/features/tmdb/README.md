# TMDb Integration

This module provides integration with The Movie Database (TMDb) API to fetch and sync movie data into the local database.

## Setup

1. Get a TMDb API key from [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
2. Add your API key to your environment variables:
   ```
   TMDB_API_KEY=your_api_key_here
   ```

## Database Changes

The integration adds two new fields to the `movies` table:
- `source`: Indicates the data source ("manual" for manually added movies, "tmdb" for movies from TMDb)
- `tmdb_id`: Stores the TMDb movie ID for duplicate prevention and future updates

## API Endpoints

### Health Check
**GET** `/tmdb/health`

Check if the TMDb service is properly configured.

**Response:**
```json
{
  "message": "TMDb service health check",
  "data": {
    "apiKeyConfigured": true,
    "serviceAvailable": true,
    "timestamp": "2025-09-27T07:55:00.000Z"
  }
}
```

### Sync Statistics
**GET** `/tmdb/stats`

Get statistics about synced movies.

**Response:**
```json
{
  "message": "Sync statistics retrieved",
  "data": {
    "totalMovies": 150,
    "tmdbMovies": 100,
    "manualMovies": 50,
    "lastSync": "2025-09-27T07:55:00.000Z"
  }
}
```

### Sync Movies from Lists
**POST** `/tmdb/sync`

Sync movies from TMDb popular, now playing, top rated, or upcoming lists.

**Request Body:**
```json
{
  "listType": "popular",  // "popular", "now_playing", "top_rated", "upcoming"
  "pages": 2              // Number of pages to sync (1-10)
}
```

**Response:**
```json
{
  "message": "Movie sync completed",
  "data": {
    "total": 40,
    "inserted": 35,
    "skipped": 5,
    "errors": 0,
    "errorDetails": []
  }
}
```

### Sync Specific Movie
**POST** `/tmdb/sync/:tmdbId`

Sync a specific movie by its TMDb ID.

**Request Body:**
```json
{
  "forceUpdate": false  // Whether to update if movie already exists
}
```

**Response:**
```json
{
  "message": "Movie inserted successfully",
  "action": "inserted",
  "data": {
    "movie_id": 123,
    "title": "Example Movie",
    "runtime_in_minutes": 120,
    "rating": "PG-13",
    "description": "Movie description...",
    "image_url": "https://image.tmdb.org/t/p/w500/poster.jpg",
    "source": "tmdb",
    "tmdb_id": 456789
  }
}
```

### Search and Sync Movies
**POST** `/tmdb/search-sync`

Search for movies on TMDb and sync the results.

**Request Body:**
```json
{
  "query": "Avengers",
  "maxResults": 10      // Maximum results to process (1-50)
}
```

**Response:**
```json
{
  "message": "Search and sync completed",
  "query": "Avengers",
  "data": {
    "total": 10,
    "inserted": 8,
    "skipped": 2,
    "errors": 0,
    "errorDetails": []
  }
}
```

## Features

- **Duplicate Prevention**: Uses TMDb ID to prevent duplicate entries
- **Data Transformation**: Automatically maps TMDb data to local database schema
- **Rate Limiting**: Includes delays to respect TMDb API rate limits
- **Error Handling**: Comprehensive error handling with detailed error reporting
- **Caching**: Integrates with existing cache system for better performance
- **Flexible Sync**: Support for different movie lists and search-based syncing

## Data Mapping

TMDb data is transformed to match the local schema:

| TMDb Field | Local Field | Notes |
|------------|-------------|-------|
| `title` | `title` | Direct mapping |
| `runtime` | `runtime_in_minutes` | Direct mapping |
| `overview` | `description` | Direct mapping |
| `poster_path` | `image_url` | Full URL constructed |
| `id` | `tmdb_id` | TMDb ID stored for reference |
| - | `source` | Set to "tmdb" |
| `adult` + `vote_average` | `rating` | Mapped to PG/PG-13/R system |

## Usage Examples

### Basic Sync
```bash
# Sync popular movies (1 page)
curl -X POST http://localhost:5000/tmdb/sync \
  -H "Content-Type: application/json" \
  -d '{"listType": "popular", "pages": 1}'
```

### Sync Specific Movie
```bash
# Sync a specific movie by TMDb ID
curl -X POST http://localhost:5000/tmdb/sync/550 \
  -H "Content-Type: application/json" \
  -d '{"forceUpdate": false}'
```

### Search and Sync
```bash
# Search for "Matrix" movies and sync top 5 results
curl -X POST http://localhost:5000/tmdb/search-sync \
  -H "Content-Type: application/json" \
  -d '{"query": "Matrix", "maxResults": 5}'
```
