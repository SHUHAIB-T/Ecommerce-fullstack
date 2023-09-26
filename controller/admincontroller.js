const session = require('express-session');
const jwt = require('jsonwebtoken')
const { transporter } = require('../config/mailConnect')
const OTP = require('../models/otpModel')
const bcrypt = require('bcrypt')
const Admin = require('../models/adminModel');
const Order = require('../models/orderModel');
const mongoose = require('mongoose');


//render dashboard
const render_dharboard = (req, res) => {
    const admin = res.locals.admin
    res.status(500).render('admin/admin-dash', { Admin: admin })
}
//redirect to dash board
const redirect_dash = (req, res) => {
    res.redirect('/admin/dash')
}

//reder login page
const render_login = async (req, res) => {
    const token = req.cookies.adminTocken;
    if (token) {
        await jwt.verify(token, process.env.SECRET_KEY, (err, decodeded) => {
            if (err) {
                res.render('admin/admin-login', { fullscreen: true, admin: true, error: req.flash('error')[0], success: req.flash('success')[0] })
                delete req.session.err
            } else {
                res.redirect('/admin/dash')
            }
        })
    } else {
        res.render('admin/admin-login', { fullscreen: true, admin: true, error: req.flash('error')[0], success: req.flash('success')[0] })
    }

}

//render forget password page
const render_forget_pass = (req, res) => {
    res.render('admin/forgetpass', { fullscreen: true, admin: true, err: req.session.otp_err })
}

const getRandomSixDigitNumber = () => {
    // Generate a random 6-digit number
    return Math.floor(100000 + Math.random() * 900000);
}

const send_otp = async (req, res) => {

    res.json(req.body.email)
    // Define email data
    const otp = getRandomSixDigitNumber();
    const mail = req.body.email
    await OTP.create({ email: mail, otp: otp })
    const mailOptions = {
        from: 'timescart11@gmail.com',
        to: mail,
        subject: 'Hello Welcome to Times cart',
        text: `this is you otp fo verification ${otp}`
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}


//verify otp
const veryfy_otp = async (req, res) => {
    const email = req.body.email
    const otp = req.body.otp;
    const user = await OTP.findOne({ email: email })
    console.log(user)
    if (user) {
        if (otp == user.otp) {
            req.session.email = email;
            res.json({ success: true })
        } else {
            res.json({ msg: "the OTP is Invalid or Expired" })
        }
    }
}

const render_rest_pass = (req, res) => {
    res.render('admin/reset-pass', { fullscreen: true, admin: true })
}
const update_password = async (req, res) => {
    let password = req.body.password[0]
    let newPass = await bcrypt.hash(password, 10)
    let admin = await Admin.findOne({ email: req.session.email })
    if (admin) {
        await Admin.updateOne({ email: req.session.email }, { password: newPass })
        req.flash('success', 'Password Updated Succerfully');
        res.redirect('/admin/login')
    }
}

//get all orders
const get_orders = async (req, res) => {

    let orderDetails = await Order.aggregate([
        {
            $project: {
                _id: 1,
                customer_id: 1, 
                items: 1,
                address: 1,
                payment_method: 1,
                status: 1,
                createdAt: 1
            }
        },
        {
            $unwind: { path: '$items' }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'items.product_id',
                foreignField: '_id',
                as: 'products'
            }
        },
        {
            $unwind: { path: '$products' }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'customer_id',
                foreignField: '_id',
                as: 'userName'
            }
        },
        {
            $unwind: { path: '$userName' }
        },
        {
            $project: {
                _id: 1,
                'userName.user_name': 1,
                'products.product_name': 1,
                items:1,
                address: 1,
                payment_method: 1,
                status: 1,
                createdAt: 1
            }
        }
    ]);

    orderDetails.forEach(obj => {
        if (obj?.createdAt) {
            obj.createdAt = formatDate(obj.createdAt);
        }
    });

    function formatDate(date) {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        return new Date(date).toLocaleDateString(undefined, options);
    }

    orderDetails.forEach(obj => {
        if (obj.items && obj.items.quantity && obj.items.price) {
            obj.items.price = obj.items.quantity * obj.items.price;
        }
    });

    const admin = res.locals.admin

    console.log(orderDetails)
    res.render('admin/orders', { admin: true, success: req.flash('success')[0], error: req.flash('error')[0], orderDetails, Admin: admin })
}

//render  manage order
const render_change_order_status = async (req, res) => {
    let admin = res.locals.admin;
    let product_id = new mongoose.Types.ObjectId(req.params.id);

    let order = await Order.aggregate([
        { $match: { 'items.product_id': product_id } },
        {
            $project: {
                _id: 1,
                customer_id: 1,
                items: 1,
                address: 1,
                payment_method: 1,
                status: 1,
                createdAt: 1
            }
        },
        {
            $unwind: { path: '$items' }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'items.product_id',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $unwind: { path: '$product' }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'customer_id',
                foreignField: '_id',
                as: 'userName'
            }
        },
        {
            $unwind: { path: '$userName' }
        },
        {
            $project: {
                _id: 1,
                'userName.user_name': 1,
                'product.product_name': 1,
                items: 1,
                address: 1,
                payment_method: 1,
                status: 1,
                createdAt: 1
            }
        }
    ]);

    order.forEach(obj => {
        if (obj.items && obj.items.quantity && obj.items.price) {
            obj.items.price = obj.items.quantity * obj.items.price;
        }
    });

    let productIdToFind = req.params.id

    const showOrder = order.find(order => order.items.product_id.toString() === productIdToFind);

    res.render('admin/order_status', { admin: true, showOrder, Admin: admin })
}

//change order status

const update_order_status = async (req, res) => {
    let status = req.body.status;
    let order_id = req.params.id;
    let product_id = req.body.product_id;

    if (status === 'Shipped') {

        //updating status if when Item shipped
        const updateOrder = await Order.updateOne({
            _id: order_id,
            'items.product_id': product_id
        }, {
            '$set': {
                'items.$.status': status,
                'items.$.shipped_on': new Date()
            }
        });
        if (updateOrder) {
            req.flash('success', 'Product status Updated Successfully');
            res.redirect('/admin/orders');
        }
    } else if (status === 'Out for Delivery') {
        const updateOrder = await Order.updateOne({
            _id: order_id,
            'items.product_id': product_id
        }, {
            '$set': {
                'items.$.status': status,
                'items.$.out_for_delivery': new Date()
            }
        });
        if (updateOrder) {
            req.flash('success', 'Product status Updated Successfully');
            res.redirect('/admin/orders');
        }
    } else if (status === 'Delivered') {
        const updateOrder = await Order.updateOne({
            _id: order_id,
            'items.product_id': product_id
        }, {
            '$set': {
                'items.$.status': status,
                'items.$.delivered_on': new Date()
            }
        });
        if (updateOrder) {
            req.flash('success', 'Product status Updated Successfully');
            res.redirect('/admin/orders');
        }
    } else {
        req.flash('error', 'Product status Updated Successfully');
        res.redirect('/admin/orders');
    }
}



module.exports = {
    render_login,
    render_dharboard,
    redirect_dash,
    render_forget_pass,
    send_otp,
    veryfy_otp,
    render_rest_pass,
    update_password,
    get_orders,
    render_change_order_status,
    update_order_status
}