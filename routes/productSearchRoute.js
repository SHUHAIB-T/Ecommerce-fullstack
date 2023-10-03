const express = require('express');
const { authenicateUser } = require('../middlewares/authMiddleware');
const router = express.Router();

const {get_searchedProducts} = require('../controller/searchController')

router.get('/search',authenicateUser, get_searchedProducts);

module.exports = router;