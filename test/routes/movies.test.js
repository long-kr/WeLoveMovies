const request = require("supertest");

const app = require("../../src/app");
const db = require("../../src/db/connection");

describe("Movie Routes", () => {
  beforeAll(() => {
    return db.migrate
      .forceFreeMigrationsLock()
      .then(() => db.migrate.rollback(null, true))
      .then(() => db.migrate.latest());
  });

  beforeEach(() => {
    return db.seed.run();
  });

  afterAll(async () => {
    return await db.migrate.rollback(null, true).then(() => db.destroy());
  });

  describe("GET /movies", () => {
    test("should return a list of all movies by default with pagination", async () => {
      const response = await request(app).get("/movies");

      const data = response.body.data;

      expect(data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: "Interstellar",
            rating: "PG-13",
            runtime_in_minutes: 169,
          }),
        ])
      );
      expect(data).toHaveLength(10); // Default pagination limit
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.pagination.totalCount).toBe(16);
    });

    test("should return active movies if `is_showing=true` is provided", async () => {
      // Set the first movie to be not showing
      const previous = await db("movies").first();
      await db("movies_theaters")
        .update({ is_showing: false })
        .where({ movie_id: previous.movie_id });

      const response = await request(app).get("/movies?is_showing=true");

      expect(response.body.data).toHaveLength(10); // Paginated results
      expect(response.body.pagination.totalCount).toBe(15); // 15 showing movies
    });

    // Pagination Tests
    test("should support pagination with default values", async () => {
      const response = await request(app).get("/movies");

      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 10,
        totalCount: 16,
        totalPages: 2,
        hasNextPage: true,
        hasPreviousPage: false,
      });
      expect(response.body.data).toHaveLength(10);
    });

    test("should support custom page size", async () => {
      const response = await request(app).get("/movies?limit=5");

      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 5,
        totalCount: 16,
        totalPages: 4,
        hasNextPage: true,
        hasPreviousPage: false,
      });
      expect(response.body.data).toHaveLength(5);
    });

    test("should support page navigation", async () => {
      const response = await request(app).get("/movies?page=2&limit=10");

      expect(response.body.pagination).toEqual({
        page: 2,
        limit: 10,
        totalCount: 16,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      });
      expect(response.body.data).toHaveLength(6); // 16 total - 10 first page = 6 remaining
    });

    test("should limit maximum page size to 50", async () => {
      const response = await request(app).get("/movies?limit=100");

      expect(response.status).toBe(200); // Should not be an error
      expect(response.body.pagination.limit).toBe(50);
    });

    // Filtering Tests
    test("should filter movies by title", async () => {
      const response = await request(app).get("/movies?title=Interstellar");

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        title: "Interstellar",
      });
      expect(response.body.pagination.totalCount).toBe(1);
    });

    test("should filter movies by rating", async () => {
      const response = await request(app).get("/movies?rating=PG-13");

      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((movie) => {
        expect(movie.rating).toBe("PG-13");
      });
    });

    test("should filter movies by runtime range", async () => {
      const response = await request(app).get("/movies?minRuntime=150&maxRuntime=200");

      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((movie) => {
        expect(movie.runtime_in_minutes).toBeGreaterThanOrEqual(150);
        expect(movie.runtime_in_minutes).toBeLessThanOrEqual(200);
      });
    });

    // Sorting Tests
    test("should sort movies by title ascending by default", async () => {
      const response = await request(app).get("/movies?limit=5");

      const titles = response.body.data.map((movie) => movie.title);
      const sortedTitles = [...titles].sort();
      expect(titles).toEqual(sortedTitles);
    });

    test("should sort movies by runtime descending", async () => {
      const response = await request(app).get(
        "/movies?sortBy=runtime_in_minutes&sortOrder=desc&limit=5"
      );

      const runtimes = response.body.data.map((movie) => movie.runtime_in_minutes);
      const sortedRuntimes = [...runtimes].sort((a, b) => b - a);
      expect(runtimes).toEqual(sortedRuntimes);
    });

    // Combined filtering and pagination tests
    test("should combine filtering, sorting, and pagination", async () => {
      const response = await request(app).get(
        "/movies?rating=PG-13&sortBy=runtime_in_minutes&sortOrder=desc&page=1&limit=3"
      );

      expect(response.body.data.length).toBeLessThanOrEqual(3);
      response.body.data.forEach((movie) => {
        expect(movie.rating).toBe("PG-13");
      });
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(3);
    });

    // Validation Tests
    test("should return 400 for invalid page number", async () => {
      const response = await request(app).get("/movies?page=0");

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("page must be a positive integer");
    });

    test("should handle large limit values gracefully", async () => {
      const response = await request(app).get("/movies?limit=100");

      // Should limit to 50, not return error
      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBe(50);
    });

    test("should return 400 for invalid rating", async () => {
      const response = await request(app).get("/movies?rating=INVALID");

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("rating must be one of");
    });

    test("should return 400 for invalid sort field", async () => {
      const response = await request(app).get("/movies?sortBy=invalid_field");

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("sortBy must be one of");
    });

    test("should return 400 for invalid sort order", async () => {
      const response = await request(app).get("/movies?sortOrder=invalid");

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("sortOrder must be 'asc' or 'desc'");
    });

    test("should return 400 when minRuntime > maxRuntime", async () => {
      const response = await request(app).get("/movies?minRuntime=200&maxRuntime=100");

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("minRuntime cannot be greater than maxRuntime");
    });
  });

  describe("GET /movies/:movieId", () => {
    test("should return a 404 if the ID given does not match any ID in the database", async () => {
      const response = await request(app).get("/movies/999999999");
      expect(response.body.error).toBeDefined();
      expect(response.statusCode).toBe(404);
    });

    test("should return movie details when given an existing ID", async () => {
      const previous = await db("movies").first();

      const response = await request(app).get(`/movies/${previous.movie_id}`);

      expect(response.body.error).toBeUndefined();
      expect(response.body.data).toEqual(previous);
    });

    test("/theaters returns the theaters for the specified movie_id", async () => {
      const previous = await db("movies").first();

      const response = await request(app).get(`/movies/${previous.movie_id}/theaters`);

      expect(response.body.error).toBeUndefined();
      expect(response.body.data[0]).toHaveProperty("name", "Regal City Center");
      expect(response.body.data).toHaveLength(3);
    });

    test("GET `/movies/:movieId/reviews` returns the reviews, with critic property, for the specified movie_id", async () => {
      const previous = await db("movies").first();

      const response = await request(app).get(`/movies/${previous.movie_id}/reviews`);

      expect(response.body.error).toBeUndefined();
      expect(response.body.data).toHaveLength(7);
      response.body.data.forEach((review) => {
        expect(review).toHaveProperty("movie_id", previous.movie_id);
        expect(review).toHaveProperty(
          "critic",
          expect.objectContaining({
            preferred_name: expect.any(String),
            surname: expect.any(String),
            organization_name: expect.any(String),
          })
        );
      });
    });

    test("should not include critics anywhere for the path `/movies/:movieId/critics`", async () => {
      const previous = await db("movies").first();

      const response = await request(app).get(`/movies/${previous.movie_id}/critics`);

      expect(response.body.error).toBeDefined();
      expect(response.statusCode).toBe(404);
    });
  });
});
