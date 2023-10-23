const Return = require('../models/returnSchema');
const mongoose = require('mongoose');

// get all the return requests
const getNotifications = async (req, res) => {
    const returns = await Return.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $unwind: '$user'
        },
        {
            $lookup: {
                from: 'products',
                localField: 'product_id',
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
                order_id: 1,
                status: 1,
                comment: 1,
                reason: 1
            }
        }
    ]);
    const admin = res.locals.admin;
    for (let request of returns) {
        if (request.status !== 'pending') {
            request.return = true;
        } else {
            request.return = false;
        }
    }
    res.render('admin/notifications', { Admin: admin, returns, admin: true, footer: true });
}

// approve request
const aproveRequest = async (req, res) => {
    let return_id = req.params.id;
    const aprove = await Return.findByIdAndUpdate({ _id: return_id }, { $set: { status: 'aproved' } }, { new: true });
    if (aprove) {
        res.json({
            success: true
        })
    }
}

// decline request
const declineRequest = async (req, res) => {
    let return_id = req.params.id;
    const aprove = await Return.findByIdAndUpdate({ _id: return_id }, { $set: { status: 'declined' } }, { new: true });
    if (aprove) {
        res.json({
            success: true
        })
    }
}

module.exports = {
    getNotifications,
    aproveRequest,
    declineRequest
}