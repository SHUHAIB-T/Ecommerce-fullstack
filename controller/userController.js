const OTP = require('../models/otpModel')
const { transporter } = require('../config/mailConnect');
const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const Product = require('../models/productModel');
const jwt = require('jsonwebtoken');
const Banner = require('../models/bannerModel');
const mongoose = require('mongoose');
const Rating = require('../models/reviewRatingmodel');

//render home
const render_home = async (req, res) => {
    const products = await Product.find({ stock: { $gt: 0 } });
    const userData = res.locals.userData;
    let cartCount;
    if (userData) {
        cartCount = userData.cart.length
    }
    let banners = await Banner.find({ banner_status: true });
    banners[0] = {
        new: "active",
        image: {
            filename: banners[0].image.filename
        },
        reference: banners[0].reference
    }

    let product;
    if (req.query.page) {
        let page = parseInt(req.query.page);
        let skip = (page - 1) * 6;
        product = products.slice(skip, skip + 6);
    } else {
        product = products.slice(0, 6);
    }

    let arr = [];
    for (let i = 1; i < products.length / 6 + 1; i++) {
        arr.push(i)
    }
    let last = arr[arr.length - 1]
    res.render('user/home', { user: true, last, userData, arr, banners, cartCount, product, footer: true });
    delete req.session.order;
}

//render user login page
const render_user_login = async (req, res) => {
    let token = req.cookies.userTocken;
    await jwt.verify(token, process.env.SECRET_KEY, async (err, decodedTocken) => {
        if (err) {
            res.render('user/login-page', { user: true, fullscreen: true, User: false, error: req.flash('error')[0], success: req.flash('success')[0], err: req.session.err })
            delete req.session.err;
        } else {
            res.redirect('/')
        }
    })
}

//render siognUp page
const render_SignUp = (req, res) => {
    res.render('user/signup-page', { fullscreen: true })
}

const getRandomSixDigitNumber = () => {
    // Generate a random 6-digit number
    return Math.floor(100000 + Math.random() * 900000);
}

//veryfy using OTP
const genarate_otp = async (req, res) => {

    res.json(req.body.user_email)
    // Define email data
    const otp = getRandomSixDigitNumber();
    const mail = req.body.user_email
    await OTP.create({ email: mail, otp: otp })
    const mailOptions = {
        from: 'timescart11@gmail.com',
        to: mail,
        subject: 'Hello Welcome to Times cart',
        text: `This is your OTP fo verification ${otp}`
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
    const email = req.body.user_email
    const otp = req.body.otp;
    const user = await OTP.findOne({ email: email })
    if (user) {
        if (otp == user.otp) {
            delete req.body.otp
            const checkUser = await User.findOne({ user_email: req.body.user_email })
            if (checkUser) {
                res.json({ err: "Email Already Exist" })
            } else {
                req.body.user_password = await bcrypt.hash(req.body.user_password, 10);
                await User.create(req.body);
                req.flash('success', 'Sign Up Succefull')
                res.json({ success: true })
            }
        } else {
            res.json({ msg: "OTP is Invalid or Expired !" })
        }
    }
}

//show product details
const show_product_details = async (req, res) => {
    let product = await Product.findById(req.params.id);

    const userData = res.locals.userData;
    let cartCount;
    if (userData) {
        cartCount = userData.cart.length
    }
    let product_id = new mongoose.Types.ObjectId(product._id);
    let user = await User.findOne({ _id: userData, 'wish_list.product_id': product_id })

    if (user) {
        product.wish = false
    } else {
        product.wish = true
    }

    let ratings = await Rating.aggregate([
        { $match: { product_id: product_id } },
        {
            $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $unwind: "$user"
        },
        {
            $project: {
                _id: 0,
                comment: 1,
                rating: 1,
                'user.user_name': 1
            }
        }
    ]);

    let sum = 0
    for (const rating of ratings) {
        sum = sum + parseInt(rating.rating)
    }

    let avarage = sum / (ratings.length);

    res.render('user/product-deatils', { user: true, ratings, avarage, fullscreen: true, cartCount, product, footer: true });
}


//add to wishlist

const add_wishlist = async (req, res) => {
    let product_id = req.params.id;
    let user_id = res.locals.userData._id;

    let user = await User.findOne({ _id: user_id, 'wish_list.product_id': product_id });
    if (user) {
        const wish_list = {
            $pull: {
                wish_list: {
                    product_id: product_id,
                }
            }
        }
        const updateWishlist = await User.findOneAndUpdate({ _id: user_id }, wish_list, { new: true });

        if (updateWishlist) {
            res.json({
                success: false
            })
        }

    } else {
        const wish_list = {
            $push: {
                wish_list: {
                    product_id: product_id,
                }
            }
        }
        const updateWishlist = await User.findOneAndUpdate({ _id: user_id }, wish_list, { new: true });
        if (updateWishlist) {
            res.json({
                success: true
            })
        }
    }
}

module.exports = {
    render_user_login,
    render_SignUp,
    genarate_otp,
    veryfy_otp,
    render_home,
    show_product_details,
    add_wishlist
}