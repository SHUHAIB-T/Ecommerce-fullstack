const jwt = require('jsonwebtoken')
const Admin = require('../models/adminModel');
const User = require('../models/userModel')

const isAdminloggedIn = async (req, res, next) => {
    let token = req.cookies.adminTocken;
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, async (err, decodedToken) => {
            if (err) {
                res.redirect('/admin/login')
            } else {
                const admin = await Admin.findOne({ _id: decodedToken.id })
                delete admin.password;
                res.locals.admin = admin;
                next()
            }
        })
    } else {
        res.redirect('/admin/login')
    }
}

// get user details 
const getUserData = (req, res, next) => {
    let token = req.cookies.userTocken;
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, async (err, decodedToken) => {
            if (!err) {
                let id = decodedToken.id;
                let user = await User.findOne({ _id: id, user_status: true })
                if (user) {
                    delete user.user_password
                    res.locals.userData = user;
                    next();
                } else {
                    res.cookie('userTocken', '', { maxAge: 1 })
                    next();
                }
            }

        })
    } else {
        next();
    }
}

const authenicateUser = async (req, res, next) => {
    const token = req.cookies.userTocken;
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, async (err, decoddedToken) => {
            if (err) {
                res.redirect('/login')
            } else {
                let id = decoddedToken.id
                let user = await User.findOne({ _id: id, user_status: true })

                if (user) {
                    res.locals.userData = user;
                    next()
                } else {
                    console.log("cookies got")
                    req.flash('error', 'access denied')
                    res.cookie('userTocken', '', { maxAge: 1 })
                    res.redirect('/login')
                }
            }
        })
    } else {
        res.redirect('/login');
    }
}

//exporting the funtion to module
module.exports = {
    isAdminloggedIn,
    getUserData,
    authenicateUser
}