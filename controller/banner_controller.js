const Banner = require('../models/bannerModel');

const render_banners_page = async (req, res) => {
    const banners = await Banner.find({ banner_status: true });
    let admin = res.locals.admin;
    // Render banner page
    res.render('banner/banner', { admin: true, banners, Admin: admin });
}

module.exports = {
    render_banners_page
}