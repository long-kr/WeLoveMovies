function notFound( req, res, next ) { 

    return next({
        status: 404,
        message: `404! Page is not found: ${req.originalUrl}`
    })
};

module.exports = notFound;