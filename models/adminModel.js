const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var adminSchema = new mongoose.Schema({
    first_name:{
        type:String,
        required:true,
    },
    last_name:{
        type:String
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    }
}
,{
    timestamps:true
});

//Export the model
module.exports = mongoose.model('Admin', adminSchema);