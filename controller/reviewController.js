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
            $lookup: {
                from: 'products',
                localField: 'product_id',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $unwind: "$product"
        },
        {
            $project: {
                product: 1,
                comment: 1,
                rating: 1
            }
        }
    ]);

    res.render('user/reviews', { user: true, User: true, user_id, reviews, footer: true })
}

// add new review
const new_review = async (req, res) => {
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
    let user_id = res.locals.userData._id
    let review = await Review.findOne({ product_id: product_id, user_id: user_id });
    if (review) {
        res.redirect(`/reviews/edit-reivew/${review._id}`);
    } else {
        res.render('user/new-review', { user: true, product_id, User: true, footer: true })
    }
}

// edit review 
const render_edit_review = async (req, res) => {
    let id = new mongoose.Types.ObjectId(req.params.id)
    let review = await Review.aggregate([
        {
            $match: {
                _id: id
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'product_id',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $unwind: "$product"
        },
        {
            $project: {
                product: 1,
                comment: 1,
                rating: 1
            }
        }
    ]);
    review = review[0];

    res.render('user/edit-review', { user: true, review, User: true, footer: true })
}

const edit_review = async (req, res) => {
    const id = req.body._id;
    delete req.body._id;
    const result = await Review.findByIdAndUpdate(id, req.body, { new: true });
    if (result) {
        res.json({
            success: true
        })
    }
}

// delete review 
const delete_review = async (req, res) => {
    const id = req.params.id;
    const result = await Review.findByIdAndDelete(id);
    if (result) {
        res.json({
            success: true
        })
    }
}

module.exports = {
    get_reviews,
    new_review,
    render_new_review,
    render_edit_review,
    edit_review,
    delete_review
}