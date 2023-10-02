const express = require('express');
const router = express.Router();

//authentication middle ware
const { authenicateUser } = require('../middlewares/authMiddleware');

const { render_user_orders ,
    cancel_order,
    get_invoice} = require('../controller/orderController')


router.get('/', authenicateUser,render_user_orders);

router.get('/cancel_order/:product_id/:order_id',authenicateUser,cancel_order);

router.get('/get-invoice',authenicateUser,get_invoice);


module.exports = router;