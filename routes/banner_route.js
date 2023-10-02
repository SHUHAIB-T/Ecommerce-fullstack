const express = require('express');
const { isAdminloggedIn } = require('../middlewares/authMiddleware');
const router = express.Router();

const { render_banners_page } = require('../controller/banner_controller')

router.get('/', isAdminloggedIn, render_banners_page);

module.exports = router;