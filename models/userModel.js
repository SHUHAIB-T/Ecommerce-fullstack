const mongoose = require('mongoose')
const bcrypt=require('bcrypt')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
var userSchema = new Schema({
    user_name:{
        type:String,
        required:true,
    },
    user_email:{
        type:String,
        required:true,
        unique:true,
    },
    user_mobile:{
        type:String,
        required:true,
    },
    cart:[{
        product_id:{
            type:ObjectId,
            required: true
        },
        quantity:{
            type:Number,
            required:true
        }
    }],
    wish_list:[{
        product_id:{
            type:ObjectId,
            required:true
        }
    }],
    user_password:{
        type:String,
        required:true,
    },  
    user_wallet:{
        type:Number,
        required:true,
        default:0,
    },
    user_wallet:{
        type:Number,
        required:true,
        default:0,
    },
    user_status:{
        type:Boolean,
        required:true,
        default:true
    }, 
    is_delete:{
        type:Boolean,
        required:true,
        default:false
    } 
},{timestamps: true });

module.exports = mongoose.model('User',userSchema);