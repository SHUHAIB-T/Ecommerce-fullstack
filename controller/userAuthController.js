const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//jwt creating tocken 
const maxAge = 1000*60*60*24;

const createToken = (id) => {
    return jwt.sign({id},process.env.SECRET_KEY,{expiresIn:maxAge})
}

const doLogin = async (req,res) => {
    console.log(req.body);
    const user = await User.findOne({user_email:req.body.email})
    if(user){
        const checkPass = await bcrypt.compare(req.body.password,user.user_password);
        console.log(checkPass)
        if(checkPass){
            const token = createToken(user._id)
            res.cookie("userTocken",token,{httpOnly:true,maxAge:maxAge}).redirect('/')
        }else{
            req.session.err = {msg:"password does not match !"}
            res.redirect('/login');
        }
    }else{
        req.session.err = {msg:"User not found !"}
        res.redirect('/login');
    }
}

module.exports = {
    doLogin
}