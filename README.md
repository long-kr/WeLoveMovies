# We Love Movies
Live: [https://welovemovie.netlify.app/](https://welovemovie.netlify.app/).

Backend is hosted serverless, please give server a minute to spin up ;)

This is source code for WeLoveMovies project. 
Built with JavaScript, Node.js, Express.js, Chai, Jasmine, PostgreSQL, Knex, and Cors.


### Instruction to install locally:
1. Fork and Clone this repository
2. Update `.env` file with a connection URL or localhost
3. Run `npm i` ( read package.json for details packages )
4. Run `npx knex migrate:latest` ( to migrate database )
5. Run `npx knex seed:run` ( to seed data )

### API endpoint:

#### Movies API
| Endpoint | Description |
| ----------- | ----------- |
| GET /movies | Get paginated list of all movies with optional filtering and sorting |
| GET /movies?is_showing=true | Get movies currently showing in theaters |
| GET /movies/:movieId | Get details of a specific movie |
| GET /movies/:movieId/theaters | Get theaters showing a specific movie |
| GET /movies/:movieId/reviews | Get reviews for a specific movie |

#### Other APIs
| Endpoint | Description |
| ----------- | ----------- |
| GET /theaters | Get all theaters |
| PUT /reviews/:reviewId | Update a review (partial or full update) |

#### Query Parameters for Movies List
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | integer | Page number (default: 1) | `?page=2` |
| `limit` | integer | Items per page (default: 10, max: 50) | `?limit=20` |
| `title` | string | Filter by movie title (partial match) | `?title=Interstellar` |
| `rating` | string | Filter by rating (G, PG, PG-13, R, NC-17) | `?rating=PG-13` |
| `minRuntime` | integer | Minimum runtime in minutes | `?minRuntime=120` |
| `maxRuntime` | integer | Maximum runtime in minutes | `?maxRuntime=180` |
| `year` | integer | Filter by release year | `?year=2014` |
| `sortBy` | string | Sort field (title, runtime_in_minutes, rating, created_at, updated_at) | `?sortBy=runtime_in_minutes` |
| `sortOrder` | string | Sort order (asc, desc) | `?sortOrder=desc` |

#### Example API Calls
```bash
# Get first 5 movies
GET /movies?limit=5

# Get PG-13 movies sorted by runtime
GET /movies?rating=PG-13&sortBy=runtime_in_minutes&sortOrder=desc

# Search for movies with "Star" in title
GET /movies?title=Star

# Get movies with runtime between 90-120 minutes
GET /movies?minRuntime=90&maxRuntime=120

# Get page 2 of currently showing movies
GET /movies?is_showing=true&page=2&limit=10
```

### Homepage
![Screenshot 2022-10-24 015929](https://user-images.githubusercontent.com/57731304/197466280-0bf117d8-9dd0-41b3-b4e7-6dfafc3aa839.jpg)
