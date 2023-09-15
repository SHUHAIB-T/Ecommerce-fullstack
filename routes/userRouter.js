const express = require('express');
const router = express.Router();
const {render_user_login,
    render_SignUp,
    genarate_otp,
    veryfy_otp,
    render_home,
    show_product_details} = require('../controller/userController');


const { doLogin } = require('../controller/userAuthController');
const { isUserloggedIn,
    getUserData, } = require('../middlewares/authMiddleware');

router.get('/',getUserData,render_home)

router.get('/login',render_user_login)

router.get('/sign-up',render_SignUp);

router.post('/get-signup-otp', genarate_otp)

router.post('/veryfy-otp', veryfy_otp);

router.post('/login',doLogin)

router.get('/buy_product/:id',isUserloggedIn, show_product_details)

router.get('/logout', (req, res) => {
    res.clearCookie('userTocken');
    res.redirect('/')
})

module.exports = router