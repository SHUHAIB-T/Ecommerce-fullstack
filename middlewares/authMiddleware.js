const jwt = require('jsonwebtoken')
const Admin = require('../models//adminModel');

const isAdminloggedIn = async (req,res,next)=> {
    let token = req.cookies.adminTocken;
    if(token){
         jwt.verify(token,process.env.SECRET_KEY,async(err,decodedToken) => {
            if(err){
                res.redirect('/admin/login')
            }else{
                console.log(decodedToken)
                const admin =await Admin.findOne({_id:decodedToken.id})
                res.locals.admin = admin;
                next()
            }
        })
    }else{
        res.redirect('/admin/login')
    }
}

//exporting the funtion to module
module.exports = {
    isAdminloggedIn
}