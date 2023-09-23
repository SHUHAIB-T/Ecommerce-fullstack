const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const order_schema = new Schema({
    customer_id: {
        type:ObjectId,
        require:true
    },
    items:[
        {
            product_id:{
                type:ObjectId,
                required:true
            },
            quantity: {
                type:Number,
                required:true
            },
            price:{
                type:Number,
                required:true
            }
        }
    ],
    address:{
        type:mongoose.Schema.Types.Mixed,
        required: true
    },
    payment_method:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    shipped_on:{
        type:Date
    },
    out_for_delivery:{
        type:Date
    },
    delivered_on:{
        type:Date
    }
},
{
    timestamps:true
});

module.exports = mongoose.model('Order',order_schema);