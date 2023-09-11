const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    cat_name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    cat_status:{
        type:Boolean,
        required:true,
        default:true
    },
    delete:{
        type:Boolean,
        required:true,
        default:false
    }
},{
    timestamps:true
})

module.exports = mongoose.model('Category',categorySchema);