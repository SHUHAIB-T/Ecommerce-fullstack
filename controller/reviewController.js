const Review = require('../models/reviewRatingmodel');
const mongoose = require('mongoose');

// get all reviews
const get_reviews = async (req, res) => {
    let user_id = res.locals.userData._id;
    let reviews = await Review.aggregate([
        {
            $match: {
                user_id: user_id
            }
        },
        {
            $lookup:{
                from:'products',
                localField: 'product_id',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $unwind: "$product"
        }
    ]);

    console.log(reviews)

    res.render('user/reviews', { user: true, User: true, user_id, reviews, footer: true })
}

// add new review
const new_review = async (req, res) => {
    console.log("here")
    let user_id = res.locals.userData._id
    let product_id = new mongoose.Types.ObjectId(req.body.product_id);
    let review = new Review({
        user_id: user_id,
        product_id: product_id,
        rating: req.body.rating,
        comment: req.body.comment
    })
    let result = await review.save();
    if (result) {
        res.json({
            success: true
        })
    }
}

// render new review form
const render_new_review = async (req, res) => {
    let product_id = req.params.id;
    res.render('user/new-review', { user: true, product_id, User: true, footer: true })
}

module.exports = {
    get_reviews,
    new_review,
    render_new_review
}