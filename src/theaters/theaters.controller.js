const service = require("./theaters.service");
const asyncError = require("../error/asyncErrorBoundary");

async function list(req, res) {
  const theaters = await service.list();
  res.json({ data: theaters });
}

module.exports = {
  list: asyncError(list),
};
