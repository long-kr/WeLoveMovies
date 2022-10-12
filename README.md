# we-love-movies-project
Live: `https://pure-eyrie-74674.herokuapp.com/movies`

This is source code for WeLoveMovies project. 

### Instruction to install locally:
1. Fork and Clone this repository
2. Update `.env` file with a connection URL or localhost
3. Run `npm i` ( read package.json for details packages )
4. Run `npx knex migrate:latest` ( to migrate database )
5. Run `npx knex seed:run` ( to seed data )

### API endpoint:
| Endpoint | return |
| ----------- | ----------- |
| GET /movies | respone with list of all movies |
| GET /movies?is_showing=true | return only those movies where the movie is currently showing in theaters |
| GET /movies/:movieId | return detail of movie id |
| GET /movies/:movieId/theaters | return all the theaters where the movie is playing |
| GET /movies/:movieId/reviews | return all the reviews for the movie |
| GET /theaters | return all the theaters |
| PUT /reviews/:reviewId | This route will allow you to partially or fully update a review |
| DELETE /reviews/:reviewId | This route will delete a review by ID |
