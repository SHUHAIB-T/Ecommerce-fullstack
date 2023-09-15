const jwt = require('jsonwebtoken')
const Admin = require('../models//adminModel');
const User = require('../models/userModel')

const isAdminloggedIn = async (req,res,next)=> {
    let token = req.cookies.adminTocken;
    if(token){
         jwt.verify(token,process.env.SECRET_KEY,async(err,decodedToken) => {
            if(err){
                res.redirect('/admin/login')
            }else{
                const admin =await Admin.findOne({_id:decodedToken.id})
                delete admin.password;
                res.locals.admin = admin;
                next()
            }
        })
    }else{
        res.redirect('/admin/login')
    }
}


const getUserData = (req,res,next)=>{
    let token = req.cookies.userTocken;
    if(token){
        jwt.verify(token,process.env.SECRET_KEY,async(err,decodedToken)=>{
            if(!err){
                let id = decodedToken.id;
                let user=await User.find({_id:id,user_status:true})
                delete user.user_password
                res.locals.userData = user;
                next();
            }

        })
    }else{
        next();
    }
}

const isUserloggedIn = async (req,res,next) => {
    const token = req.cookies.userTocken;
    if(token){
        jwt.verify(token,process.env.SECRET_KEY, async (err,decoddedToken) =>{
            if(err){
                res.redirect('/login')
            }else{
                let id = decoddedToken.id
                let user = await User.find({_id:id,user_status:true})
                delete user.user_password;
                res.locals.userData = user;
                next()
            }
        })
    }else{
        res.redirect('/login')
    }
}

//exporting the funtion to module
module.exports = {
    isAdminloggedIn,
    getUserData,
    isUserloggedIn
}