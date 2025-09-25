# Movies API - Pagination and Filtering

## Overview

The Movies API now supports advanced pagination and filtering capabilities to help you efficiently retrieve movie data.

## Base Endpoint

```
GET /movies
```

## Query Parameters

### Pagination Parameters

| Parameter | Type | Default | Description | Validation |
|-----------|------|---------|-------------|------------|
| `page` | integer | 1 | Page number (1-based) | Must be positive integer |
| `limit` | integer | 10 | Number of items per page | 1-50 (max 50) |

### Sorting Parameters

| Parameter | Type | Default | Description | Validation |
|-----------|------|---------|-------------|------------|
| `sortBy` | string | "title" | Field to sort by | Must be one of: title, runtime_in_minutes, rating, created_at, updated_at |
| `sortOrder` | string | "asc" | Sort order | Must be "asc" or "desc" |

### Filter Parameters

| Parameter | Type | Description | Validation |
|-----------|------|-------------|------------|
| `title` | string | Filter by movie title (case-insensitive partial match) | Must be string |
| `rating` | string | Filter by movie rating | Must be one of: G, PG, PG-13, R, NC-17 |
| `minRuntime` | integer | Minimum runtime in minutes | Must be non-negative number |
| `maxRuntime` | integer | Maximum runtime in minutes | Must be non-negative number |
| `year` | integer | Filter by release year | Must be valid year (1800 to current year + 10) |
| `is_showing` | boolean | Filter by showing status | Must be "true" or "false" |

## Response Format

```json
{
  "data": [
    {
      "movie_id": 1,
      "title": "Interstellar",
      "runtime_in_minutes": 169,
      "rating": "PG-13",
      "description": "A team of explorers travel through a wormhole in space...",
      "image_url": "https://example.com/interstellar.jpg",
      "created_at": "2021-02-23T20:48:13.315Z",
      "updated_at": "2021-02-23T20:48:13.315Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 16,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Examples

### Basic Pagination

```bash
# Get first page with default settings
GET /movies

# Get second page with 5 items per page
GET /movies?page=2&limit=5
```

### Filtering Examples

```bash
# Filter by title
GET /movies?title=Interstellar

# Filter by rating
GET /movies?rating=PG-13

# Filter by runtime range
GET /movies?minRuntime=120&maxRuntime=180

# Filter by year
GET /movies?year=2014

# Filter by showing status
GET /movies?is_showing=true
```

### Sorting Examples

```bash
# Sort by runtime (longest first)
GET /movies?sortBy=runtime_in_minutes&sortOrder=desc

# Sort by rating (alphabetical)
GET /movies?sortBy=rating&sortOrder=asc

# Sort by creation date (newest first)
GET /movies?sortBy=created_at&sortOrder=desc
```

### Combined Examples

```bash
# Get PG-13 movies sorted by runtime, paginated
GET /movies?rating=PG-13&sortBy=runtime_in_minutes&sortOrder=desc&page=1&limit=5

# Get currently showing movies with specific runtime range
GET /movies?is_showing=true&minRuntime=90&maxRuntime=120&sortBy=title
```

## Error Responses

### Validation Errors (400 Bad Request)

```json
{
  "status": "fail",
  "message": "page must be a positive integer; rating must be one of: G, PG, PG-13, R, NC-17"
}
```

Common validation errors:
- Invalid page number (must be positive)
- Invalid limit (must be 1-50)
- Invalid sortBy field
- Invalid sortOrder
- Invalid rating value
- Invalid year range
- minRuntime > maxRuntime

### Server Errors (500 Internal Server Error)

```json
{
  "status": "error",
  "message": "Error retrieving movies list"
}
```

## Performance Considerations

- Maximum limit is capped at 50 items per page to prevent performance issues
- Database queries are optimized with proper indexing
- Filtering and sorting are handled at the database level for efficiency
- Pagination metadata is calculated efficiently using separate count queries

## Migration Notes

The new API is backward compatible. Existing endpoints without query parameters will continue to work with default pagination settings (page=1, limit=10).

Legacy behavior:
- `GET /movies` returns all movies
- `GET /movies?is_showing=true` returns showing movies

New behavior:
- `GET /movies` returns paginated results (10 per page)
- `GET /movies?is_showing=true` returns paginated showing movies
- All responses include pagination metadata

