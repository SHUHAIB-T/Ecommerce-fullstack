const OTP = require('../models/otpModel')
const { transporter } = require('../config/mailConnect');
const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const Product = require('../models/productModel');
const jwt = require('jsonwebtoken');
const Address = require('../models/addressModel');
const Order = require('../models/orderModel');


//render home
const render_home = async (req, res) => {
    const product = await Product.find({ stock: { $gt: 0 } });
    const userData = res.locals.userData;
    let cartCount;
    if (userData) {
        cartCount = userData.cart.length
    }
    res.render('user/home', { user: true, userData, cartCount, product, footer: true });
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
    const product = await Product.findById(req.params.id);

    const userData = res.locals.userData;
    let cartCount;
    if (userData) {
        cartCount = userData.cart.length
    }
    res.render('user/product-deatils', { user: true, fullscreen: true, cartCount, product, footer: true })
}

const addProductToCart = async (userID, productId) => {
    const user = await User.findOne({ _id: userID, 'cart.product_id': productId });
    if (user) {
        return false;
    } else {

        const cart = {
            $push: {
                cart: {
                    product_id: productId,
                    quantity: 1
                }
            }
        };
        const updatedCart = await User.findByIdAndUpdate({ _id: userID }, cart, { new: true });
        return updatedCart;
    }
}

//add item to the cart
const add_product_to_cart = async (req, res) => {
    let productId = req.params.id;
    let userID = res.locals.userData._id;
    let updatedUser = await addProductToCart(userID, productId);
    if (updatedUser) {
        let cartCount = updatedUser.cart.length;
        res.json({
            status: true,
            count: cartCount
        });
    } else {
        res.json({
            status: false
        })
    }

}

//render cart page
const render_cart_page = async (req, res) => {
    let userData = res.locals.userData
    let userid = userData._id;
    let cartList = await User.aggregate([
        { $match: { _id: userid } },
        { $project: { cart: 1, _id: 0 } },
        { $unwind: { path: '$cart' } },
        {
            $lookup: {
                from: 'products',
                localField: 'cart.product_id',
                foreignField: '_id',
                as: 'prod_detail'
            }
        },
        { $unwind: { path: '$prod_detail' } },
    ])
    for (prod of cartList) {
        prod.price = prod.prod_detail.selling_price * prod.cart.quantity
    }

    let totalPrice = 0;
    for (let i = 0; i < cartList.length; i++) {
        totalPrice = totalPrice + cartList[i].price;
    }

    let cartCount = userData.cart.length;

    if (cartCount > 0) {
        res.render('user/cart', { user: true, cartList, cartCount, totalPrice, footer: true })
    } else {
        res.render('user/emptyCart', { user: true, footer: true })

    }
}


//remove from cart 
const remove_product_from_cart = async (req, res) => {
    let id = req.params.id;
    let userId = res.locals.userData._id
    await User.updateOne({ _id: userId }, { $pull: { cart: { product_id: id } } })
    res.json({
        status: true
    })
}


//increment quantity
const incrementQuantity = async (req, res) => {
    let userID = res.locals.userData._id;
    const productId = req.params.id;
    let user = await User.findOne({ _id: userID })
    const stock = await Product.findOne({ _id: productId }, { stock: 1, _id: 0 })
    const currentQuantity = user.cart.find(item => item.product_id == productId)
    let currentStock = stock.stock
    let quantity = currentQuantity.quantity;

    if (quantity > currentStock - 1) {
        res.json({
            success: false
        })
    } else {
        const updated = await User.updateOne(
            {
                _id: userID,
                'cart.product_id': productId
            },
            {
                $inc: {
                    'cart.$.quantity': 1
                }
            }
        );
        if (updated) {
            res.json({
                success: true
            })
        }
    }

}

//decrement quantity
const minus_cart_quantity = async (req, res) => {
    let userID = res.locals.userData._id;
    const productId = req.params.id;

    const updated = await User.updateOne(
        {
            _id: userID,
            'cart.product_id': productId
        },
        {
            $inc: {
                'cart.$.quantity': -1
            }
        }
    );
    if (updated) {
        res.json({
            success: true
        })
    }
}

//render checkout page
const render_checkout = async (req, res) => {
    let userId = res.locals.userData._id;
    const address = await Address.find({ customer_id: userId, delete: false });
    let cart = res.locals.userData.cart
    let sellingPrice = [];
    for (let i = 0; i < cart.length; i++) {
        let sellingprice = await Product.find({ _id: cart[i].product_id }, { _id: 0, selling_price: 1 });
        sellingPrice.push(sellingprice);
    }
    let selling = [].concat(...sellingPrice);
    let totalAmount = 0;
    for (let i = 0; i < cart.length; i++) {
        totalAmount = totalAmount + (parseInt(selling[i].selling_price) * cart[i].quantity)
    }
    res.render('user/checkout', { user: true, address, cart, totalAmount, checkout: true });


}

//place order
const place_order = async (req, res) => {
    let customer_id = res.locals.userData._id;
    let cartList = await User.aggregate([
        { $match: { _id: customer_id } },
        { $project: { cart: 1, _id: 0 } },
        { $unwind: { path: '$cart' } },
        {
            $lookup: {
                from: 'products',
                localField: 'cart.product_id',
                foreignField: '_id',
                as: 'prod_detail'
            }
        },
        { $unwind: { path: '$prod_detail' } ,},
        {$project:{
            'prod_detail_id':1,
            'prod_detail.selling_price':1,
            cart:1
        }}
    ])

    let items = [];
    for(let i=0;i<cartList.length;i++){
        items.push({
            product_id:cartList[i].cart.product_id,
            quantity:cartList[i].cart.quantity,
            price:parseInt(cartList[i].prod_detail.selling_price)
        })
    }

    const address = await Address.findOne({_id:req.body.address});


    let order = {
        customer_id: customer_id,
        items: items,
        address:address,
        payment_method: req.body.payment_option,
        status: "confirmed",
    }

    const createOrder = await Order.create(order);

    if(createOrder){

        //empty the cart
        await User.updateOne({ _id: customer_id }, { $unset: { cart: '' } })

        //reduce the stock count
        for(let i=0;i<items.length;i++){
            await Product.updateOne({_id:items[i].product_id},{$inc:{stock:-(items[i].quantity)}})
        }
        res.render('user/orderSuccess', { user: true, footer: true });
        req.session.order = {
            status:true
        }
    }
}

//prevent going back
const verify_order = (req,res,next) =>{
    let order = req.session.order;
    if(order){
        res.redirect('/');
    }else{
        next();
    }
}


module.exports = {
    render_user_login,
    render_SignUp,
    genarate_otp,
    veryfy_otp,
    render_home,
    show_product_details,
    add_product_to_cart,
    render_cart_page,
    remove_product_from_cart,
    incrementQuantity,
    minus_cart_quantity,
    render_checkout,
    place_order,
    verify_order
}