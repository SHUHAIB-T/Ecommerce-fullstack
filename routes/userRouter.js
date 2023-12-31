const express = require('express');
const router = express.Router();
const {render_user_login,
    render_SignUp,
    genarate_otp,
    veryfy_otp,
    render_home,
    show_product_details,
    add_wishlist} = require('../controller/userController');

const { doLogin } = require('../controller/userAuthController');

// user authentication
const { authenicateUser,
    getUserData, } = require('../middlewares/authMiddleware');

router.get('/',getUserData,render_home)

router.get('/login',getUserData,render_user_login)

router.get('/sign-up',render_SignUp);

router.post('/get-signup-otp', genarate_otp)

router.post('/veryfy-otp', veryfy_otp);

router.post('/login',doLogin)

router.get('/view_product/:id',getUserData,show_product_details)

router.get('/buy_product/:id', authenicateUser,)

router.get('/view_product/add-to-wishlist/:id',authenicateUser, add_wishlist)

router.get('/logout', (req, res) => {
    res.cookie('userTocken','',{ maxAge:1})
    res.redirect('/');
})

module.exports = router