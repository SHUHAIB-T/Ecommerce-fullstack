const mongoose = require('mongoose')
const bcrypt=require('bcrypt')
var userSchema = new mongoose.Schema({
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
    user_password:{
        type:String,
        required:true,
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