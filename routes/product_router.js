const express = require('express');
const router = express.Router();
const { isAdminloggedIn } = require('../middlewares/authMiddleware');
const {upload} = require('../middlewares/upload');

const { render_product_page,
    render_new_product,
    add_product,
    render_edit_product,
    update_product,
    deleteProduct } = require('../controller/productController');



//product dash board
router.get('/',isAdminloggedIn,render_product_page )

//new product page
router.get('/new-product', isAdminloggedIn, render_new_product)

router.post('/add-product',upload.fields([{name:"images"},{name:"primaryImage"}]),isAdminloggedIn,add_product);

router.get('/edit-product/:id',isAdminloggedIn,render_edit_product)

router.post('/update-product',upload.fields([{name:"images"},{name:"primaryImage"}]),isAdminloggedIn,update_product)

router.get('/delete_products/:id', isAdminloggedIn, deleteProduct)


module.exports = router