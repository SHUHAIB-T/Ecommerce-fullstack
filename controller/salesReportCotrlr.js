const Order = require('../models/orderModel');


const sales_report = async () => {

    //fetching needed data from db
    const salesReport = await Order.aggregate([
        {
            $match: {
                "items.status": "Delivered"
            }
        },
        {
            $unwind: "$items"
        },
        {
            $match: {
                "items.status": "Delivered"
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "items.product_id",
                foreignField: "_id",
                as: "product"
            }
        },
        {
            $unwind: "$product"
        },
        {
            $lookup: {
                from: "users",
                localField: "customer_id",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $lookup: {
                from: "categories",
                localField: "product.category_id",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: "$category"
        },
        {
            $project: {
                'product.product_name': 1,
                'user.user_name': 1,
                'items.delivered_on': 1,
                createdAt: 1,
                'items.quantity': 1,
                'items.price': 1,
                'category.cat_name': 1,
                payment_method: 1
            }
        }
    ]);

    return salesReport;

}

const render_sales_report = async (req, res) => {

    const salesReport = await sales_report();

    //formating all dates 
    salesReport.forEach((sales) => {
        sales.createdAt = sales.createdAt.toLocaleDateString();
        sales.items.delivered_on = sales.items.delivered_on.toLocaleDateString();
    })
    let admin = res.locals.admin
    res.render('admin/salesReport', { footer: true, admin: true, Admin: admin, salesReport })

}

const filter_data = async (req, res) => {
    let salesReport = await sales_report();

    ///filtering the sales report
    if (req.body.from != '') {
        const inputDate = new Date(req.body.from);
        salesReport = salesReport.filter((data) => data.items.delivered_on >= inputDate);
    }

    if (req.body.to != '') {
        const inputDate = new Date(req.body.to)
        salesReport = salesReport.filter((data) => data.items.delivered_on <= inputDate);
    }
    if (req.body.payment_method != '') {
        if (req.body.payment_method === 'COD') {
            salesReport = salesReport.filter((data) => {
                return data.payment_method === 'COD'
            })
        } else if (req.body.payment_method === 'Online Payment') {
            salesReport = salesReport.filter((data) => {
                return data.payment_method === 'Online Payment'
            })
        }
    }

    //formating all dates
    salesReport.forEach((sales) => {
        sales.createdAt = sales.createdAt.toLocaleDateString();
        sales.items.delivered_on = sales.items.delivered_on.toLocaleDateString();
    })
    let admin = res.locals.admin;

    res.render('admin/salesReport', { footer: true, admin: true, Admin: admin, salesReport });

}


module.exports = {
    render_sales_report,
    filter_data,
    sales_report
}