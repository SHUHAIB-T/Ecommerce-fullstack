const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


// return schema
const returnRequestSchema = new Schema({
    order_id: {
        type: ObjectId,
        ref: 'orders'
    },
    product_id: {
        type: ObjectId,
    },
    user_id: {
        type: ObjectId,
        ref: 'users'
    },
    reason: {
        type: String,
    },
    status: {
        type: String,
    },
    comment: {
        type: String
    }
});

module.exports = mongoose.model('Return', returnRequestSchema);