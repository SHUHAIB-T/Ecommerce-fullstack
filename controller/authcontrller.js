const Admin = require('../models/adminModel')
const bcrypt = require('bcrypt')
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken');
const session = require('express-session')

//jwt creating tocken 
const maxAge = 1000 * 60 * 60 * 24;
const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: maxAge })
}

const createAdmin = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findAdmin = await Admin.findOne({ email: email });
    if (!findAdmin) {
        //create new user
        req.body.password = await bcrypt.hash(req.body.password, 10);
        const newAdmin = await Admin.create(req.body);
        res.json(newAdmin);
    } else {
        //throw error User already Exist
        throw new Error("user alreay Exist")
    }
})

const doLogin = async (req, res) => {
    const admin = await Admin.findOne({ email: req.body.email });
    if (admin) {
        const checkPass = await bcrypt.compare(req.body.password, admin.password);
        if (checkPass) {
            const token = createToken(admin._id)
            res.cookie("adminTocken", token, { httpOnly: true, maxAge: maxAge }).redirect('/admin/dash')
        } else {
            req.flash('error', 'password Not matching')
            console.log(req.session.err)
            res.redirect('/admin/login')
        }
    } else {
        req.flash('error', 'no admin Exist with this Email Id')
        res.redirect('/admin/login')
    }

}

module.exports = {
    createAdmin,
    doLogin
}