const service = require("./reviews.service");
const asyncError = require("../error/asyncErrorBoundary");

async function hasReview(req, res, next) {
    const { reviewId } = req.params;
    const review = await service.read(reviewId);

    if(review) {
        res.locals.review = review;
        return next();
    }

    next({
        status: 404,
        message: "Review cannot be found"
    })
};

function mustHasProperties (propertyName) {
    return (req, res, next) => {
        const { data } = req.body;

        if(!data[propertyName]) {
            console.log("1")
            return next({
                status: 400,
                message: `Update body must have ${propertyName}`
            })
        };

        next();
    };
};

function validProperties (req, res, next) {
    const { data } = req.body;

    const valid_Properties = [
        "content",
        "score",
    ]

    const invalidField = Object.keys(data).filter((key) => {
        return !valid_Properties.includes(key);
    });

    if(invalidField.length){
        return next({
            status: 400,
            message: `Invalid field(s): ${invalidField.join(", ")}`
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