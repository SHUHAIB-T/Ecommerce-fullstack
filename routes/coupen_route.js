const express = require('express');
const router = express.Router();
const { isAdminloggedIn } = require('../middlewares/authMiddleware');

//importing functions from conroller
const { render_coupen_page,
       create_new_coupen ,
       render_new_coupen,
       edit_coupen,
       update_coupen,
       delete_coupen} = require('../controller/coupenController');

router.get('/', isAdminloggedIn, render_coupen_page);

router.get('/new-coupen', isAdminloggedIn, render_new_coupen);

router.post('/create-coupen', isAdminloggedIn, create_new_coupen);

router.get('/edit_coupen/:id', isAdminloggedIn, edit_coupen);

router.post('/edit-coupen/:id', isAdminloggedIn, update_coupen);

router.get('/delete-coupen/:id', isAdminloggedIn, delete_coupen);


module.exports = router;