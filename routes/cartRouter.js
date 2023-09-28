const express = require('express');
const router = express.Router();

const { authenicateUser } = require('../middlewares/authMiddleware');


const { render_cart_page,
    remove_product_from_cart,
    incrementQuantity,
    minus_cart_quantity,
    render_checkout,
    place_order,
    verify_order,
    add_product_to_cart,
    order_success,
    verifyPaymenet } = require('../controller/cartController');


router.get('/', authenicateUser, render_cart_page);

router.get('/add-to-cart/:id', authenicateUser, add_product_to_cart)

router.get('/remove-from-cart/:id', authenicateUser, remove_product_from_cart)

router.get('/add-quantity/:id', authenicateUser, incrementQuantity)

router.get('/minus-quantity/:id', authenicateUser, minus_cart_quantity);

router.get('/checkout', authenicateUser, verify_order, render_checkout);

router.post('/place-order', authenicateUser, place_order);

router.post('/verify-payment', authenicateUser, verifyPaymenet)

router.get('/order-success', order_success)

module.exports = router;