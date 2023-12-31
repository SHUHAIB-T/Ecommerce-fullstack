const express = require('express');
const router = express.Router();

//authentication middle ware
const { authenicateUser } = require('../middlewares/authMiddleware');

const { render_user_orders,
    cancel_order,
    get_invoice,
    render_order_details,
    cancel_all_order,
    return_order,
    order_return } = require('../controller/orderController')



router.get('/', authenicateUser, render_user_orders);

router.get('/order-details/:id', authenicateUser, render_order_details);

router.get('/cancel_order/:product_id/:order_id', authenicateUser, cancel_order);

router.get('/cancel_all_order/:order_id', authenicateUser, cancel_all_order);

router.get('/get-invoice', authenicateUser, get_invoice);

router.get('/return-order', authenicateUser, return_order);

router.post('/order-return', authenicateUser, order_return);


module.exports = router;