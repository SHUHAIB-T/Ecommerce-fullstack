const express = require('express');
const router = express.Router();
const {render_user_login,
    render_SignUp,
    genarate_otp,
    veryfy_otp,
    render_home,
    show_product_details,
    add_product_to_cart,
    render_cart_page,
    remove_product_from_cart,
    incrementQuantity,
    minus_cart_quantity,
    render_checkout,place_order,
    verify_order} = require('../controller/userController');


const { doLogin } = require('../controller/userAuthController');
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

router.get('/add-to-cart/:id',authenicateUser,add_product_to_cart)

router.get('/remove-from-cart/:id',authenicateUser,remove_product_from_cart)

router.get('/view-cart',authenicateUser,render_cart_page)

router.get('/add-quantity/:id',authenicateUser,incrementQuantity)

router.get('/minus-quantity/:id', authenicateUser, minus_cart_quantity);

router.get('/checkout',authenicateUser,verify_order,render_checkout);

router.post('/place-order', authenicateUser,place_order)

router.get('/logout', (req, res) => {
    res.cookie('userTocken','',{ maxAge:1})
    res.redirect('/')
})

module.exports = router