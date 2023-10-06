const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

// review and Rating
const reviewSchema = new Schema({
    user_id: {
        type:ObjectId,
        required:true
    },
    product_id: {
        type:ObjectId,
        required:true
    },
    review: {
        type:String,
        required:true
    },
    rating: {
        type:Number,
        required:true
    }
})