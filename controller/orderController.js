const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Return = require('../models/returnSchema');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const pdf = require("pdf-creator-node");
const fs = require("fs");

//showing user's all orders
const render_user_orders = async (req, res) => {
    let user_id = res.locals.userData._id

    let orderDetails = await Order.aggregate([
        {
            $match: {
                customer_id: user_id
            }
        },
        {
            $project: {
                _id: 1,
                items: 1,
                address: 1,
                payment_method: 1,
                status: 1,
                createdAt: 1,
                coupon: 1
            }
        }
    ]);
    orderDetails = orderDetails.reverse();
    let arr = [];
    for (let i = 1; i < orderDetails.length / 4 + 1; i++) {
        arr.push(i);
    }
    let page = parseInt(req.query.page);
    let skip = (page - 1) * 4
    if (req.query.page) {
        orderDetails = orderDetails.slice(skip, skip + 4);
    } else {
        orderDetails = orderDetails.slice(0, 4);
    }
    let last = arr[arr.length - 1];

    res.render('user/order', { user: true, arr, last, User: true, orderDetails, footer: true });
}

const render_order_details = async (req, res) => {
    let order_id = new mongoose.Types.ObjectId(req.params.id);
    let orderDetails = await Order.aggregate([
        {
            $match: {
                _id: order_id
            }
        },
        {
            $unwind: "$items"
        },
        {
            $lookup: {
                from: 'products',
                localField: 'items.product_id',
                foreignField: '_id',
                as: "products"
            }
        },
        {
            $unwind: "$products"
        }
    ]);

    // Loop through the array and format the dates
    for (const order of orderDetails) {
        switch (order.items.status) {
            case 'confirmed':
                order.items.track = 15;
                order.items.ordered = true;
                order.items.delivered = false;
                order.items.cancelled = false;
                order.items.shipped = false;
                order.items.outdelivery = false;
                order.items.return = false;
                order.items.inReturn = false;
                order.items.needHelp = true;
                break;
            case 'Shipped':
                order.items.track = 38;
                order.items.ordered = true;
                order.items.delivered = false;
                order.items.cancelled = false;
                order.items.shipped = true;
                order.items.outdelivery = false;
                order.items.return = false;
                order.items.inReturn = false;
                order.items.needHelp = true;
                break;
            case 'Out for Delivery':
                order.items.track = 65;
                order.items.ordered = true;
                order.items.delivered = false;
                order.items.cancelled = false;
                order.items.shipped = false;
                order.items.outdelivery = true;
                order.items.return = false;
                order.items.inReturn = false;
                order.items.needHelp = true;
                break;
            case 'Delivered':
                order.items.track = 100;
                order.items.ordered = false;
                order.items.cancelled = false;
                order.items.shipped = false;
                order.items.delivered = true;
                order.items.outdelivery = false;
                order.items.return = true;
                order.items.inReturn = false;
                order.items.needHelp = false;
                break;
            case 'cancelled':
                order.items.track = 0;
                order.items.ordered = false;
                order.items.cancelled = true;
                order.items.delivered = false;
                order.items.shipped = false;
                order.items.outdelivery = false;
                order.items.return = false;
                order.items.inReturn = false;
                order.items.needHelp = true;
                break;
            default:
                order.items.track = 0;
                order.items.pending = true;
                order.items.inReturn = false;
        }
    }
    const isInReturn = await Return.findOne({ order_id: order_id });
    if (isInReturn) {
        for (const order of orderDetails) {
            const orderProductId = (await order.items.product_id).toString();
            const returnProductId = (await isInReturn.product_id).toString();

            if (orderProductId === returnProductId) {
                order.items.inReturn = true;
                order.items.return = false;
                order.items.needHelp = false;
                order.items.status = isInReturn.status;
            }
        }
    }

    res.render('user/order-details', { User: true, orderDetails, footer: true, user: true });
}

//cancel order function
const cancel_order = async (req, res) => {
    const user = res.locals.userData;
    let user_id = user._id;
    let product_id = new mongoose.Types.ObjectId(req.params.product_id);
    let order_id = new mongoose.Types.ObjectId(req.params.order_id);

    const checkCoupen = await Order.aggregate([
        {
            $match: {
                "coupon": { $exists: true },
                _id: order_id,
                'items.product_id': product_id
            }
        }
    ]);
    if (checkCoupen.length > 0) {
        res.json({
            success: false
        })
    } else {

        const updateOrder = await Order.updateOne({
            _id: order_id,
            'items.product_id': product_id
        }, {
            '$set': {
                'items.$.status': 'cancelled',
                'items.$.cancelled_on': new Date()
            }
        });

        if (updateOrder) {

            let order = await Order.findById({ _id: order_id });

            //adding money to wallet if it is online payment
            if (order.payment_method === 'Online Payment' || order.payment_method === 'wallet') {
                let price = await Order.aggregate([
                    {
                        $match: {
                            _id: order_id,
                            'items.product_id': product_id
                        }
                    },
                    {
                        $unwind: { path: '$items' }
                    },
                    {
                        $match: {
                            'items.product_id': new mongoose.Types.ObjectId(product_id)
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            price: '$items.price'
                        }
                    }
                ]);

                const wallet = price[0].price;
                // updating wallet
                const updateWallet = await User.findByIdAndUpdate({ _id: user_id }, { $set: { user_wallet: parseFloat(user.user_wallet) + parseInt(wallet) } });

                // Marking in wallet history
                const newHistoryItem = {
                    amount: parseInt(wallet),
                    status: "Credit",
                    time: Date.now()
                };

                const MarkWallet = await User.findByIdAndUpdate({ _id: user_id }, { $push: { wallet_history: newHistoryItem } });


            }
            let quantity = await Order.aggregate([
                {
                    $match: {
                        _id: order_id,
                        'items.product_id': product_id
                    }
                },
                {
                    $unwind: { path: '$items' }
                },
                {
                    $match: {
                        'items.product_id': product_id
                    }
                },
                {
                    $project: {
                        _id: 0,
                        quantity: '$items.quantity'
                    }
                }
            ]);

            let count = quantity[0].quantity
            const updateStock = await Product.updateOne({ _id: product_id }, { $inc: { stock: count } });

            res.json({
                success: true,
            })

        }
    }

}

// cancel all prodcts
const cancel_all_order = async (req, res) => {
    const user = res.locals.userData;
    let user_id = user._id;
    const order_id = req.params.order_id;
    const updateOrder = await Order.updateOne(
        { _id: order_id },
        {
            $set: {
                'items.$[elem].status': 'cancelled',
                'items.$[elem].cancelled_on': new Date(),
                status: 'cancelled'
            }
        },
        {
            arrayFilters: [{ 'elem.status': { $ne: 'cancelled' } }]
        }
    );
    if (updateOrder) {

        let order = await Order.findById({ _id: order_id });

        // changin the quantity of All products
        let items = await Order.find(
            { _id: order_id },
            { _id: 0, items: 1 }
        );
        let arrayItem = items[0].items;
        for (const item of arrayItem) {
            let product_id = item.product_id;
            let Quantity = item.quantity;
            await Product.findByIdAndUpdate({ _id: product_id }, { $inc: { stock: Quantity } });
        }

        //adding money to wallet if it is online payment
        if (order.payment_method === 'Online Payment' || order.payment_method === 'wallet') {
            let price = await Order.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(order_id)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        total_amount: 1
                    }
                }
            ]);
            const wallet = price[0].total_amount;

            // updating wallet
            const updateWallet = await User.findByIdAndUpdate({ _id: user_id }, { $set: { user_wallet: parseFloat(user.user_wallet) + parseInt(wallet) } });

            // Marking in wallet history
            const newHistoryItem = {
                amount: parseInt(wallet),
                status: "Credit",
                time: Date.now()
            };

            const marckWallet = await User.findByIdAndUpdate({ _id: user_id }, { $push: { wallet_history: newHistoryItem } });


        }
        res.json({
            success: true,
        })

    }

}

// get invoice and download
const get_invoice = async (req, res) => {

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

    // download pdf
    const html = fs.readFileSync('./views/pdf/invoice.hbs', "utf8");
    const options = {
        format: "A4",
        orientation: "portrait",
        border: "10mm",
        header: {
            height: "5mm",
            contents: '<div style="text-align: center;">INVOICE</div>'
        },
        childProcessOptions: {
            env: {
                OPENSSL_CONF: '/dev/null'
            }
        }
    };
    const document = {
        html: html,
        data: {
            showOrder
        },
        path: "./invoice.pdf",
        type: "",
    };

    pdf.create(document, options).then(() => {
        const pdfStream = fs.createReadStream("invoice.pdf");
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=invoice.pdf`);
        pdfStream.pipe(res);
        setTimeout(() => {
            fs.unlink('./invoice.pdf', (err) => {
                if (err) {
                    throw new Error(err.message);
                }
            });
        }, 5000);
    }).catch((error) => {
        console.error("this is the error", error);
        res.status(500).send("Error generating the PDF");
    });
}
const return_order = async (req, res) => {
    let orderId = req.query.order_id;
    let product_id = req.query.product_id;
    let user_id = res.locals.userData._id;
    let returnDetails = {
        order_id: orderId,
        product_id: product_id,
        user_id: user_id
    }
    res.render('user/return', { user: true, User: true, returnDetails });
}

// retun request post
const order_return = async (req, res) => {
    let user_id = new mongoose.Types.ObjectId(res.locals.userData._id);
    let retrn = new Return({
        order_id: req.body.order_id,
        user_id: user_id,
        product_id: req.body.product_id,
        reason: req.body.reason,
        status: "pending",
        comment: req.body.comment
    });
    retrn.save()
        .then((retrn) => {
            console.log('Return request saved:', retrn);
        });
    res.json({
        success: true
    });

}

module.exports = {
    render_user_orders,
    cancel_order,
    get_invoice,
    render_order_details,
    cancel_all_order,
    return_order,
    order_return
}