const express = require('express');
const { isAdminloggedIn } = require('../middlewares/authMiddleware');
const { upload1 } = require('../middlewares/upload');
const router = express.Router();

const { render_banners_page,
    render_new_banners_page,
    create_new_banner,
    render_edit_banner,
    update_banner,
    delete_banner } = require('../controller/banner_controller');

router.get('/', isAdminloggedIn, render_banners_page);

router.get('/new-banner', isAdminloggedIn, render_new_banners_page);

router.post('/create-banner', isAdminloggedIn, upload1.fields([{ name: "banner_image" }]), create_new_banner);

router.get('/edit_banner/:id', isAdminloggedIn, render_edit_banner);

router.post('/edit-banner/:id', isAdminloggedIn, upload1.fields([{ name: "banner_image" }]), update_banner);

router.get('/delete-banner', isAdminloggedIn, delete_banner);

module.exports = router;