const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const productShema = new Schema({
    product_name:{
        type:String,
        required:true
    },
    brand_name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    category_id:{
        type:ObjectId,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    primary_image:{
        name:{
            type:String,
            required:true
        },
        path:{
            type:String,
            required:true
        }
    },
    secondary_images:[{
        name:{
            type:String,
            required:true,
        },
        path:{
            type:String,
            required:true
        }
    }],
    actual_price:{
        type:String,
        required:true
    },
    selling_price:{
        type:String,
        required:true
    },
    color:{
        type:String,
        required:true
    },
    GST:{
        type:Number,
        required:true
    },
    delete:{
        type:Boolean,
        required:true,
        default:false
    },
    status:{
        type:Boolean,
        required:true,
        default:true
    },
},
{
    timestamps:true
})

module.exports = mongoose.model('Products', productShema)