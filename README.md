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
| Endpoint | return |
| ----------- | ----------- |
| GET /movies | respone with list of all movies |
| GET /movies?is_showing=true | return only those movies where the movie is currently showing in theaters |
| GET /movies/:movieId | return detail of movie id |
| GET /movies/:movieId/theaters | return all the theaters where the movie is playing |
| GET /movies/:movieId/reviews | return all the reviews for the movie |
| GET /theaters | return all the theaters |
| PUT /reviews/:reviewId | This route will allow you to partially or fully update a review |

### Homepage
![Screenshot 2022-10-24 015929](https://user-images.githubusercontent.com/57731304/197466280-0bf117d8-9dd0-41b3-b4e7-6dfafc3aa839.jpg)
