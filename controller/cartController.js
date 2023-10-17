//requireiing all models
const Address = require('../models/addressModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Payment = require('../models/paymentModel');
const Coupen = require('../models/coupenSchema');
const mongoose = require('mongoose');

//requiring razorpay
const Razorpay = require('razorpay');

const crypto = require('crypto');

//Creating Razorpay instance 
var instance = new Razorpay({
    key_id: 'rzp_test_I43lYVXIyrWCQF',
    key_secret: process.env.RAZ_SECRET_KEY,
});


//adding item to cart
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


//adding product to cart
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
//render cart
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


//remove item from cart list
const remove_product_from_cart = async (req, res) => {
    let id = req.params.id;
    let userId = res.locals.userData._id
    await User.updateOne({ _id: userId }, { $pull: { cart: { product_id: id } } })
    res.json({
        status: true
    })
}


//increment item count by one
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

//decrement item by one 
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
    let user = res.locals.userData
    let wallet;
    if (totalAmount <= user.user_wallet) {
        wallet = true;
    } else {
        wallet: false;
    }
    let user_id = user._id;

    // fetching all availabe coupens from db
    let coupens = await Coupen.aggregate([{
        $match: {
            start_date: { $lte: new Date() },
            exp_date: { $gte: new Date() },
            is_delete: false,
            $expr: {
                $and: [
                    { $ne: ["$max_count", "$used_count"] },
                    { $not: { $in: [user_id, "$user_list"] } }

                ],
            }
        }
    }]);
    function formatDateString(inputDateString) {
        const dateObject = new Date(inputDateString);

        const year = dateObject.getUTCFullYear();
        const month = String(dateObject.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dateObject.getUTCDate()).padStart(2, '0');

        const formattedDate = `${day}-${month}-${year}`;
        return formattedDate;
    }
    coupens.forEach((e) => {
        e.exp_date = formatDateString(e.exp_date);
    })

    if (req.query.coupen) {
        const total = req.query.total;
        const coupen = await Coupen.findOne({ _id: req.query.coupen });
        if (coupen.min_amount <= total) {
            let dicount = coupen.discount;
            totalAmount = totalAmount - (totalAmount * dicount / 100);
            res.json({
                success: true,
                total: totalAmount,
                coupen_id: coupen._id,
                discount: coupen.discount,
                coupen_code: coupen.coupon_code
            });
        } else {
            res.json({
                success: false,
                min_amount: coupen.min_amount
            })
        }
    }


    // rendering to checkout page
    res.render('user/checkout', { user: true, coupens, wallet, user, address, cart, totalAmount, checkout: true });


}

//create order 
const place_order = async (req, res) => {
    let customer_id = res.locals.userData._id;
    let status;
    if (req.body.payment_method === 'COD' || req.body.payment_method === 'wallet') {
        status = 'confirmed'
    } else {
        status = 'pending'
    }
    let order;

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
        { $unwind: { path: '$prod_detail' }, },
        {
            $project: {
                'prod_detail_id': 1,
                'prod_detail.selling_price': 1,
                cart: 1
            }
        }
    ])

    let items = [];
    const address = await Address.findOne({ _id: req.body.address });
    if (req.body.coupen != '') {

        const couponId = new mongoose.Types.ObjectId(req.body.coupen);
        const userId = res.locals.userData._id;
        if (status === 'confirmed') {
            let coupon = await Coupen.findByIdAndUpdate(
                { _id: couponId },
                {
                    $inc: { used_count: 1 },
                    $push: { user_list: userId },
                },
                {
                    new: true
                }
            );
        }
        let dicount = req.body.discount
        let coupen_code = req.body.coupen_code
        for (let i = 0; i < cartList.length; i++) {
            items.push({
                product_id: cartList[i].cart.product_id,
                quantity: cartList[i].cart.quantity,
                price: (parseInt(cartList[i].prod_detail.selling_price)) - (parseInt(cartList[i].prod_detail.selling_price) * dicount / 100),
                status: status
            });
        }
        order = {
            customer_id: customer_id,
            items: items,
            address: address,
            payment_method: req.body.payment_method,
            total_amount: parseInt(req.body.price),
            status: status,
            coupon: {
                coupon_id: couponId,
                discount: dicount,
                code: coupen_code
            }
        }



    } else {
        for (let i = 0; i < cartList.length; i++) {
            items.push({
                product_id: cartList[i].cart.product_id,
                quantity: cartList[i].cart.quantity,
                price: parseInt(cartList[i].prod_detail.selling_price),
                status: status
            });
        }
        order = {
            customer_id: customer_id,
            items: items,
            address: address,
            status: status,
            payment_method: req.body.payment_method,
            total_amount: parseInt(req.body.price)
        }
    }

    if (req.body.payment_method === 'COD') {
        const createOrder = await Order.create(order);
        if (createOrder) {

            //empty the cart
            await User.updateOne({ _id: customer_id }, { $unset: { cart: '' } })

            //reduce the stock count 
            for (let i = 0; i < items.length; i++) {
                await Product.updateOne({ _id: items[i].product_id }, { $inc: { stock: -(items[i].quantity) } })
            }
            req.session.order = {
                status: true
            }
            res.json({
                success: true
            });
        }
    } else if (req.body.payment_method === 'wallet') {
        const createOrder = await Order.create(order);
        if (createOrder) {
            const user = res.locals.userData;
            // empty cart
            await User.updateOne({ _id: customer_id }, { $unset: { cart: '' } });

            // decreasing the wallet amount
            await User.updateOne({ _id: customer_id }, { $set: { user_wallet: parseInt(user.user_wallet) - parseInt(req.body.price) } });

            // Marking in wallet history
            const newHistoryItem = {
                amount: parseInt(req.body.price),
                status: "Debit",
                time: Date.now()
            };


            const updatedUser = await User.findByIdAndUpdate(
                { _id: customer_id },
                { $push: { wallet_history: newHistoryItem } },
                { new: true }
            );


            //reduce the stock count 
            for (let i = 0; i < items.length; i++) {
                await Product.updateOne({ _id: items[i].product_id }, { $inc: { stock: -(items[i].quantity) } })
            }
            req.session.order = {
                status: true
            }
            res.json({
                success: true
            })
        }
    } else {
        const createOrder = await Order.create(order);

        let total = parseInt(req.body.price);
        let orderId = createOrder._id;

        let user = await User.findById(res.locals.userData._id);

        //craete order for razorpay
        const Razorder = await createRazOrder(orderId, total).then((order) => order);

        const timestamp = Razorder.created_at;
        const date = new Date(timestamp * 1000); // Convert the Unix timestamp to milliseconds

        // Format the date and time
        const formattedDate = date.toISOString();

        //creating a instance for payment details
        let payment = new Payment({
            payment_id: Razorder.id,
            amount: parseInt(Razorder.amount) / 100,
            currency: Razorder.currency,
            order_id: orderId,
            status: Razorder.status,
            created_at: formattedDate,
        });

        //saving in to db
        await payment.save();

        res.json({
            status: true,
            order: Razorder,
            user
        })
    }
}

//create razorpay order 
const createRazOrder = (orderId, total) => {
    return new Promise((resolve, reject) => {
        let options = {
            amount: total * 100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: orderId.toString()
        };
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log(err)
            }
            resolve(order);
        });
    })

}

//verifying payment
const verifyPaymenet = async (req, res) => {
    const hmac = crypto.createHmac("sha256", process.env.RAZ_SECRET_KEY);
    hmac.update(req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id);
    let generatedSignature = hmac.digest("hex");
    let isSignatureValid = generatedSignature === req.body.razorpay_signature;

    if (isSignatureValid) {

        let customer_id = res.locals.userData._id
        //empty the cart
        await User.updateOne({ _id: customer_id }, { $unset: { cart: '' } })
        let paymentId = req.body.razorpay_order_id;
        const orderID = await Payment.findOne({ payment_id: paymentId }, { _id: 0, order_id: 1 });

        const order_id = orderID.order_id;

        const updateOrder = await Order.updateOne({ _id: order_id }, { $set: { 'items.$[].status': 'confirmed', status: 'confirmed' } });

        let couponId = await Order.findOne({ _id: order_id }, { coupon: 1, _id: 0 });

        if (couponId) {
            couponId = couponId.coupon.coupon_id;
            if (couponId) {
                let updateCoupon = await Coupen.findByIdAndUpdate(
                    { _id: couponId },
                    {
                        $inc: { used_count: 1 },
                        $push: { user_list: customer_id },
                    },
                    {
                        new: true
                    }
                );
            }
        }

        req.session.order = {
            status: true
        }
        res.json({
            success: true
        })
    }
}

//render sucecess page 
const order_success = async (req, res) => {
    let user_id = new mongoose.Types.ObjectId(res.locals.userData._id);
    let order = await Order.aggregate([
        {
            $match: {
                customer_id: user_id
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $limit: 1
        }
    ]);
    let order_id = order[0]._id;
    res.render('user/orderSuccess', { order: order_id, user: true, footer: true });
}

//prevent going back to checkout page
const verify_order = (req, res, next) => {
    let order = req.session.order;
    if (order) {
        res.redirect('/');
    } else {
        next();
    }
}

module.exports = {
    add_product_to_cart,
    render_cart_page,
    remove_product_from_cart,
    incrementQuantity,
    minus_cart_quantity,
    render_checkout,
    place_order,
    verify_order,
    order_success,
    verifyPaymenet
}