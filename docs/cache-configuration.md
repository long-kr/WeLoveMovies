# Cache Configuration

## Overview

The We Love Movies application now includes a simple in-memory cache system to improve performance by reducing database queries for frequently accessed data.

## Environment Variables

Add these environment variables to your `.env` file to configure the cache:

```bash
# Cache Configuration
CACHE_TTL=300000                    # Default TTL in milliseconds (5 minutes)
CACHE_MAX_SIZE=1000                 # Maximum number of cache entries
CACHE_CLEANUP_INTERVAL=60000        # Cleanup interval in milliseconds (1 minute)
```

## Cache TTL (Time To Live) Settings

Different types of data have different cache durations:

- **Movies**: 10 minutes (600000ms) - Movies don't change frequently
- **Movie Lists**: 5 minutes (300000ms) - Lists may change more often
- **Theaters**: 10 minutes (600000ms) - Theater data is relatively static
- **Reviews**: 2-5 minutes (120000-300000ms) - Reviews change more frequently
- **Movie Theaters**: 5 minutes (300000ms) - Showtimes may change

## Cache Management Endpoints

The application provides several endpoints for cache management:

### Get Cache Statistics
```
GET /cache/stats
```

### Cache Health Check
```
GET /cache/health
```

### Clear All Cache
```
DELETE /cache/clear
```

### Clear Cache by Pattern
```
DELETE /cache/clear/pattern/{pattern}
```

### Clear Movie Cache
```
DELETE /cache/clear/movie/{movieId}
```

### Clear Review Cache
```
DELETE /cache/clear/review/{reviewId}
```

### Warm Up Cache
```
POST /cache/warmup
```

## Cache Keys

The cache uses structured keys for different types of data:

- `movies:list:{filters}` - Movie list queries
- `movies:read:{movieId}` - Individual movie data
- `movies:theaters:{movieId}` - Theaters showing a movie
- `movies:reviews:{movieId}` - Reviews for a movie
- `theaters:list` - All theaters with movies
- `reviews:read:{reviewId}` - Individual review data
- `reviews:update:{reviewId}` - Review with critic data

## Cache Invalidation

The cache automatically invalidates related entries when data is modified:

- When a review is updated or deleted, related movie review caches are cleared
- Cache entries expire automatically based on their TTL
- Manual cache clearing is available through the management endpoints

## Performance Benefits

The cache provides several performance benefits:

1. **Reduced Database Load**: Frequently accessed data is served from memory
2. **Faster Response Times**: Cached data is returned immediately
3. **Better Scalability**: Reduces database connection pressure
4. **Automatic Cleanup**: Expired entries are automatically removed

## Monitoring

Use the cache statistics endpoint to monitor cache performance:

```bash
curl http://localhost:5000/cache/stats
```

This returns information about:
- Total cache entries
- Active vs expired entries
- Cache size in bytes
- Configuration settings

## Best Practices

1. **Monitor Cache Hit Rates**: Use the stats endpoint to ensure good cache utilization
2. **Appropriate TTL**: Set TTL values based on how frequently data changes
3. **Cache Warming**: Use the warmup endpoint during application startup for critical data
4. **Memory Management**: Monitor memory usage, especially with large datasets
5. **Cache Invalidation**: Ensure proper cache invalidation when data is modified

## Troubleshooting

### High Memory Usage
- Reduce `CACHE_MAX_SIZE` if memory usage is too high
- Decrease TTL values to expire entries more quickly

### Poor Cache Performance
- Increase TTL values for stable data
- Use cache warming for frequently accessed data
- Check cache hit rates using the stats endpoint

### Stale Data
- Ensure proper cache invalidation in write operations
- Reduce TTL values for frequently changing data
- Use manual cache clearing when needed


