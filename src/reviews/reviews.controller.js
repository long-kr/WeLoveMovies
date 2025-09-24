const service = require("./reviews.service");
const asyncError = require("../error/asyncErrorBoundary");
const { NotFoundError, ValidationError, DatabaseError } = require('../error/CustomError');

async function hasReview(req, res, next) {
    const { reviewId } = req.params;
    
    if (!reviewId) {
        throw new ValidationError('ReviewId is required');
    }

    try {
        const review = await service.read(reviewId);
        if (!review) {
            throw new NotFoundError('Review cannot be found');
        }
        res.locals.review = review;
        return next();
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new DatabaseError('Error checking review existence');
    }
}

function mustHasProperties(propertyName) {
    return (req, res, next) => {
        const { data } = req.body;

        if (!data) {
            throw new ValidationError('Request body must include data object');
        }

        if (!data[propertyName]) {
            throw new ValidationError(`Update body must have ${propertyName}`);
        }

        next();
    };
}

function validProperties(req, res, next) {
    const { data } = req.body;

    if (!data) {
        throw new ValidationError('Request body must include data object');
    }

    const validProperties = [
        "content",
        "score",
    ];

    const invalidFields = Object.keys(data).filter(key => !validProperties.includes(key));

    if (invalidFields.length) {
        throw new ValidationError(`Invalid field(s): ${invalidFields.join(", ")}`);
    }

    next();
        })
    };

    next(); 
};

function validScore(req, res, next) {
    const { data } = req.body;

    if(isNaN(data.score)) {
        return next({
            status: 400,
            message: `Score input must be a Number`
        })
    };

    next();
};

async function update(req, res) {
    const updatedReview = {
        ...req.body.data,
        review_id: res.locals.review.review_id,
    };
    
    const updated = await service.update(updatedReview);
    const data = await service.returnUpdate(res.locals.review.review_id);
    
    res.json({ data });
};

async function destroy(req, res) {
    const deletedReview = await service.destroy(res.locals.review.review_id);
    res.sendStatus(204);
};

module.exports = {
    update: [
                asyncError(hasReview),
                validProperties,
                asyncError(update)
            ],
    delete: [ asyncError(hasReview), asyncError(destroy) ]
}