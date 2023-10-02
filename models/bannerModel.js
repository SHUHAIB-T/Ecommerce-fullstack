const mongoose = require('mongoose');

var bannerSchema = new mongoose.Schema(
    {
        banner_name: {
            type: String,
            required: true,
        },
        image: {
            filename: String,
            originalname: String,
            path: String,
        },
        reference: {
            type: String,
            required: true,
        },
        banner_status: {
            type: String,
            required: true,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Banner', bannerSchema);