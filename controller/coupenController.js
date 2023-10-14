const Coupen = require('../models/coupenSchema');
const mongoose = require('mongoose');

// render coupen page
const render_coupen_page = async (req, res) => {

    const coupens = await Coupen.find({ is_delete: false }); // Fetching all coupons
    const admin = res.locals.admin;

    // Formatting all dates
    const formattedCoupens = coupens.map((data) => {
        const formattedStartDate = new Date(data.start_date).toLocaleDateString();
        const formattedExpDate = new Date(data.exp_date).toLocaleDateString();

        return {
            ...data.toObject(),
            start_date: formattedStartDate,
            exp_date: formattedExpDate,
        };
    });

    // Render coupen page
    res.render('coupen/coupen', { admin: true, formattedCoupens, Admin: admin });
}

//create new coupen
const create_new_coupen = async (req, res) => {
    const coupen = new Coupen({
        coupon_code: req.body.coupon_code,
        discount: req.body.discount,
        start_date: req.body.start_date,
        exp_date: req.body.exp_date,
        max_count: req.body.max_count,
        min_amount: req.body.min_amount,
        used_count: req.body.used_count,
        discription: req.body.discription,
    });

    //creating coupen in db
    const createCoupen = await coupen.save();

    if (createCoupen) {
        res.json({ success: true });
    }
}

const render_new_coupen = async (req, res) => {
    const admin = res.locals.admin
    res.render('coupen/new_coupen', { admin: true, Admin: admin });
}

//render eidt coupen page
const edit_coupen = async (req, res) => {
    let coupon = await Coupen.findById(req.params.id);
    const admin = res.locals.admin

    coupon = coupon.toObject();

    //formatting the dates
    function formatDateToDDMMYYYY(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }
    coupon.start_date = formatDateToDDMMYYYY(coupon.start_date);
    coupon.exp_date = formatDateToDDMMYYYY(coupon.exp_date);
    res.render('coupen/edit_coupen', { admin: true, coupon, Admin: admin });
}

//edit coupen
const update_coupen = async (req, res) => {
    let id = req.params.id;
    let data = req.body;
    let coupon = await Coupen.findByIdAndUpdate({ _id: id }, data, { new: true });
    if (coupon) {
        res.json({
            success: true
        })
    }
}

//delete the coupon
const delete_coupen = async (req, res) => {
    let id = new mongoose.Types.ObjectId(req.params.id);
    let coupon = await Coupen.updateOne({ _id: id }, { is_delete: true });
    if (coupon) {
        res.json({
            success: true
        })
    }
}

module.exports = {
    render_coupen_page,
    create_new_coupen,
    render_new_coupen,
    edit_coupen,
    update_coupen,
    delete_coupen
}