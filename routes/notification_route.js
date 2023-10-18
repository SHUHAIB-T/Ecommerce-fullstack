const express = require('express');
const router = express.Router();
const { isAdminloggedIn } = require('../middlewares/authMiddleware');
const { getNotifications,
    aproveRequest,
    declineRequest } = require('../controller/notificationsController');

router.get('/', isAdminloggedIn, getNotifications);

router.get('/approve/:id', isAdminloggedIn, aproveRequest);

router.get('/decline/:id', isAdminloggedIn, declineRequest);

module.exports = router;