const service = require("./theaters.service");
const asyncError = require("../error/asyncErrorBoundary");
const { DatabaseError } = require('../error/CustomError');

async function list(req, res) {
    try {
        const theaters = await service.list();
        res.json({ data: theaters });
    } catch (error) {
        throw new DatabaseError('Failed to retrieve theaters list');
    }
}

module.exports = {
    list: asyncError(list),
}