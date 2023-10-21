const session = require('express-session');
const jwt = require('jsonwebtoken')
const { transporter } = require('../config/mailConnect')
const OTP = require('../models/otpModel')
const bcrypt = require('bcrypt')
const Admin = require('../models/adminModel');
const Order = require('../models/orderModel');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Product = require('../models/productModel');


//render dashboard
const render_dharboard = async (req, res) => {
    const admin = res.locals.admin;
    let sales = await Order.aggregate([
        {
            $match: {
                "items.status": "Delivered"
            }
        }
    ]);
    let totalRevenew = 0;
    sales.forEach((sale) => {
        totalRevenew += sale.total_amount;
    });
    const currentYear = new Date().getFullYear();

    let yearsArray = [];
    for (let year = currentYear; year >= 2022; year--) {
        yearsArray.push(year);
    }

    const custommers = (await User.find({ is_delete: false })).length;
    const products = (await Product.find({ delete: false })).length;
    try {
        let orders = await Order.aggregate([

            {
                $lookup: {
                    from: 'users',
                    localField: 'customer_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $unwind: '$items'
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
                $unwind: '$product'
            },
            {
                $project: {
                    _id: 1,
                    'user.user_name': 1,
                    'product.product_name': 1,
                    address: 1,
                    items: 1,
                    total_amount: 1,
                    createdAt: 1,
                    payment_method: 1
                }
            }
        ]);


        const queryParams = req.query;

        // Filter by day if "day" query parameter is provided
        if (queryParams.day !== undefined && queryParams.day !== "") {
            const day = new Date();
            orders = orders.filter((order) => {
                // Extract the day from the "createdAt" field and compare
                const orderDay = new Date(order.createdAt).setHours(0, 0, 0, 0);
                return orderDay >= day.setHours(0, 0, 0, 0);
            });
        }

        // to get the start and end of the month
        function getStartAndEndOfMonth() {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            return { startOfMonth, endOfMonth };
        }

        if (queryParams.month !== undefined && queryParams.month !== "") {
            const { startOfMonth, endOfMonth } = getStartAndEndOfMonth();
            orders = orders.filter((order) => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= startOfMonth && orderDate <= endOfMonth;
            });
        }

        // get the start and end of the week
        function getStartAndEndOfWeek() {
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setHours(0, 0, 0, 0);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7);
            return { startOfWeek, endOfWeek };
        }

        if (queryParams.week !== undefined && queryParams.week !== "") {
            const { startOfWeek, endOfWeek } = getStartAndEndOfWeek();
            orders = orders.filter((order) => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= startOfWeek && orderDate < endOfWeek;
            });
        }
        res.render('admin/admin-dash', { custommers, orders, products, totalRevenew, yearsArray, Admin: admin, footer: true });
        
    } catch (err) {
        res.send( err.message)
    }
}

// get dashboard Items
const getGraphDetails = async (req, res) => {

    const sales = await Order.aggregate([
        {
            $match: {
                "items.status": "Delivered"
            }
        }
    ]);
    const monthlyRevenue = Array(12).fill(0);
    let year = req.query.year;
    if (year) {
        year = parseInt(year);
    } else {
        year = new Date().getFullYear();
    }

    sales.forEach((sale) => {
        if (sale.items && sale.items.length > 0) {
            const saleYear = new Date(sale.createdAt).getFullYear();
            if (year === saleYear) {
                sale.items.forEach((item) => {
                    const deliveredOn = new Date(item.delivered_on);
                    const month = deliveredOn.getMonth();
                    const totalAmount = sale.total_amount;
                    monthlyRevenue[month] += totalAmount;
                });
            }
        }
    });
    res.json({
        success: true,
        data: monthlyRevenue
    });
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
                items: 1,
                address: 1,
                payment_method: 1,
                status: 1,
                createdAt: 1
            }
        }
    ]);

    orderDetails.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
    });

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


    orderDetails.forEach((e) => {
        if (e.items.status === "cancelled") {
            e.items.cancelled = true;
            e.items.delivered = false;
            e.items.all = false;
        } else if (e.items.status === "Delivered") {
            e.items.cancelled = false;
            e.items.delivered = true;
            e.items.all = false;
        } else {
            e.items.all = true;
            e.items.cancelled = false;
            e.items.delivered = false;
        }
    });

    const admin = res.locals.admin;

    res.render('admin/orders', { admin: true, success: req.flash('success')[0], error: req.flash('error')[0], orderDetails, Admin: admin })
}

//render  manage order
const render_change_order_status = async (req, res) => {
    let admin = res.locals.admin;
    let product_id = new mongoose.Types.ObjectId(req.query.productId);
    let order_id = new mongoose.Types.ObjectId(req.query.orderId);
    let order = await Order.aggregate([
        {
            $match: {
                _id: order_id,
                'items.product_id': product_id
            }
        },
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
                as: 'user'
            }
        },
        {
            $unwind: { path: '$user' }
        },
        {
            $project: {
                _id: 1,
                'user.user_name': 1,
                'user._id': 1,
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

    let productIdToFind = req.query.productId

    const showOrder = order.find(order => order.items.product_id.toString() === productIdToFind);

    if (showOrder.items.status === "Delivered") {
        showOrder.items.delivered = true;
        showOrder.items.pending = false;
        showOrder.items.out_forDelivery = false;
        showOrder.items.shipped = false;
        showOrder.items.confirmed = false;
    } else if (showOrder.items.status === "pending") {
        showOrder.items.delivered = false;
        showOrder.items.pending = true;
        showOrder.items.out_forDelivery = false;
        showOrder.items.shipped = false;
        showOrder.items.confirmed = false;
    } else if (showOrder.items.status === "confirmed") {
        showOrder.items.delivered = false;
        showOrder.items.pending = false;
        showOrder.items.out_forDelivery = false;
        showOrder.items.shipped = false;
        showOrder.items.confirmed = true;
    } else if (showOrder.items.status === "Shipped") {
        showOrder.items.delivered = false;
        showOrder.items.pending = false;
        showOrder.items.out_forDelivery = false;
        showOrder.items.shipped = true;
        showOrder.items.confirmed = false;
    } else if (showOrder.items.status === "Out for Delivery") {
        showOrder.items.delivered = false;
        showOrder.items.pending = false;
        showOrder.items.out_forDelivery = true;
        showOrder.items.shipped = false;
        showOrder.items.confirmed = false;
    }

    console.log(showOrder)
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

//get invoice
const get_invoice = async (req, res) => {
    let admin = res.locals.admin;
    let product_id = new mongoose.Types.ObjectId(req.query.productId);
    let order_id = new mongoose.Types.ObjectId(req.query.orderId);
    let order = await Order.aggregate([
        {
            $match: {
                _id: order_id,
                'items.product_id': product_id
            }
        },
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
                as: 'user'
            }
        },
        {
            $unwind: { path: '$user' }
        },
        {
            $project: {
                _id: 1,
                'user.user_name': 1,
                'user._id': 1,
                'user.user_email': 1,
                'user.user_mobile': 1,
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
    order.forEach(obj => {
        if (obj?.createdAt) {
            obj.createdAt = formatDate(obj.createdAt);
        }
    });

    function formatDate(date) {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        return new Date(date).toLocaleDateString(undefined, options);
    }

    let productIdToFind = req.query.productId

    const showOrder = order.find(order => order.items.product_id.toString() === productIdToFind);

    res.render('pdf/invoice', { admin: true, showOrder, Admin: admin })
}

module.exports = {
    render_login,
    render_dharboard,
    getGraphDetails,
    redirect_dash,
    render_forget_pass,
    send_otp,
    veryfy_otp,
    render_rest_pass,
    update_password,
    get_orders,
    render_change_order_status,
    update_order_status,
    get_invoice,
}