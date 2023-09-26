const express = require('express');
const router = express.Router();

const { authenicateUser } = require('../middlewares/authMiddleware');
const { render_my_Account,
        render_edit_page,
        update_detals ,
        verify_pass,
        updateNewPass,
        add_new_address,
        render_Address,
        render_edit_address,
        update_user_address,
        delete_address,
        add_new_address_checkout,
        show_wishlist,removefromWishlist} = require('../controller/myAccountController');

router.get('/', authenicateUser, render_my_Account)

router.get('/edit-details/:id', authenicateUser, render_edit_page);

router.post('/update-detail/:id', update_detals);

router.post('/verify/:id',verify_pass);

router.post('/upadate_pass/:id',updateNewPass);

router.get('/my-address/',authenicateUser,render_Address)

router.post('/my-address/new-address',add_new_address);

router.post('/checkout/new-address',add_new_address_checkout);

router.get('/my-address/edit-address/:id',authenicateUser,render_edit_address)

router.post('/my-address/update-address/:id',authenicateUser,update_user_address);

router.get('/my-address/delete-address/:id',delete_address);   

router.get('/wishlist', authenicateUser, show_wishlist);

router.get('/remove-from-wishlist/:id', authenicateUser,removefromWishlist)

module.exports = router 