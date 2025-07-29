const knex = require("knex")(require("../../knexfile").production);

exports.handler = async () => {
  try {
    await knex.migrate.latest();
    return {
      statusCode: 200,
      body: "Migrations ran successfully.",
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "Migration failed: " + err.message,
    };
  }
};
