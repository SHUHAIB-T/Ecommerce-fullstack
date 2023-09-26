const express = require('express');
const { isAdminloggedIn } = require('../middlewares/authMiddleware');
const router = express.Router();

//require category
const { crateCategory, 
    UpdateCategory,render_category_page,
    render_Edit_Category,
    render_new_category,
    delete_category } = require('../controller/categoryController')


//admin category section
router.get('/',isAdminloggedIn, render_category_page);

router.get('/new-category', isAdminloggedIn, render_new_category);

router.post('/new-category', crateCategory);

router.get('/delete_category/:id',isAdminloggedIn,delete_category);

router.get('/edit_category/:id',isAdminloggedIn,render_Edit_Category );

router.post('/upadate_category',isAdminloggedIn,UpdateCategory );

module.exports = router;