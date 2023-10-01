const express = require('express');
const { isAdminloggedIn } = require('../middlewares/authMiddleware');
const router = express.Router();

const { render_sales_report,
    filter_data } = require('../controller/salesReportCotrlr')

router.get('/', isAdminloggedIn, render_sales_report);

router.post('/filter', isAdminloggedIn, filter_data)


module.exports = router;