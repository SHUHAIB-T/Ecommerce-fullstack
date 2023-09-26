const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');

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
            $project: {
                _id: 1,
                'products.product_name': 1,
                'products.primary_image': 1,
                items: 1,
                address: 1,
                payment_method: 1,
                status: 1,
                createdAt: 1
            }
        }
    ]);

    // Function to format a date to a desired string format
    function formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true // Include AM/PM
        });
    }

    // Loop through the array and format the dates
    for (const order of orderDetails) {
        order.createdAt = formatDate(order.createdAt);

        if (order.items.shipped_on) {
            order.items.shipped_on = formatDate(order.items.shipped_on);
        }
        if (order.items.out_for_delivery) {
            order.items.out_for_delivery = formatDate(order.items.out_for_delivery);
        }
        if (order.items.delivered_on) {
            order.items.delivered_on = formatDate(order.items.delivered_on);
        }
        if (order.items.cancelled_on) {
            order.items.cancelled_on = formatDate(order.items.cancelled_on);
        }

        switch (order.items.status) {
            case 'confirmed':
                order.items.track = 15;
                order.items.ordered = true;
                order.items.delivered = false;
                order.items.cancelled = false;
                break;
            case 'Shipped':
                order.items.track = 38;
                order.items.ordered = true;
                order.items.delivered = false;
                order.items.cancelled = false;
                break;
            case 'Out for Delivery':
                order.items.track = 65;
                order.items.ordered = true;
                order.items.delivered = false;
                order.items.cancelled = false;
                break;
            case 'Delivered':
                order.items.track = 100;
                order.items.ordered = false;
                order.items.cancelled = false;
                order.items.delivered = true;
                break;
            case 'cancelled':
                order.items.track = 0;
                order.items.ordered = false;
                order.items.cancelled = true;
                order.items.delivered = false;
                break;
            default:
                order.items.track = 0;
        }
    }
    orderDetails = orderDetails.reverse();
    res.render('user/order', { user: true, User: true, orderDetails, footer: true })
}

//cancel order function
const cancel_order = async (req, res) => {
    let user_id = res.locals.userData._id;
    let product_id = req.params.product_id;
    let order_id = req.params.order_id;

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

        let quantity = await Order.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(order_id),
                    'items.product_id': new mongoose.Types.ObjectId(product_id)
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
                    quantity: '$items.quantity'
                }
            }
        ])

        let count = quantity[0].quantity

        const updateStock = await Product.updateOne({ _id: product_id }, { $inc: { stock: count } })

        res.json({
            success: true,
        })
    }

}

module.exports = {
    render_user_orders,
    cancel_order
}