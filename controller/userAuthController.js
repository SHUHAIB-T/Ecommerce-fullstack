const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//jwt creating tocken 
const maxAge = 1000 * 60 * 60 * 24;

const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: maxAge })
}

const doLogin = async (req, res) => {
    const user = await User.findOne({ user_email: req.body.email })
    if (user) {
        if (user.user_status) {
            const checkPass = await bcrypt.compare(req.body.password, user.user_password);
            if (checkPass) {
                const token = createToken(user._id)
                res.cookie("userTocken", token, { httpOnly: true, maxAge: maxAge }).redirect('/')
            } else {
                req.session.err = { msg: "password does not match!" }
                res.redirect('/login');
            }
        } else {
            req.session.err = { msg: "Your Access has been denied   " }
            res.redirect('/login');
        }

    } else {
        req.session.err = { msg: "User not found !" }
        res.redirect('/login');
    }
}

module.exports = {
    doLogin
}