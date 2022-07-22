const service = require("./theaters.service");
const asyncError = require("../error/asyncErrorBoundary");

async function list(req, res, next) {
    res.json({ data: await service.list() })
}


module.exports = {
    list: asyncError(list),
}