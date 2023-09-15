const express = require('express');
const router = express.Router();
const { isAdminloggedIn } = require('../middlewares/authMiddleware');

const {show_all_customers,
    customer_block,
    customer_unblock} = require('../controller/customerController');

//list all customers 
router.get('/',isAdminloggedIn,show_all_customers);

router.get('/change_status/:id',isAdminloggedIn,customer_block)

router.get('/change_status_unblock/:id',isAdminloggedIn,customer_unblock)


//export the customer router
module.exports = router