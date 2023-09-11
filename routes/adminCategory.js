const express = require('express');
const { isAdminloggedIn } = require('../middlewares/authMiddleware');
const router = express.Router();

//require category
const { crateCategory, getcategory, 
    UpdateCategory,render_category_page,
    render_Edit_Category } = require('../controller/categoryController')


//admin category section
router.get('/',isAdminloggedIn, render_category_page)

router.post('/create_category', crateCategory)

router.get('/edit_category/:id',isAdminloggedIn,render_Edit_Category )

router.post('/upadate_category',UpdateCategory )

module.exports = router;