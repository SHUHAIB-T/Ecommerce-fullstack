const Product = require('../models/productModel');


const get_searchedProducts = async (req, res) => {

    let Products = await Product.aggregate([
        {
            $match: {
                delete: false,
                status: true
            }
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'category_id',
                foreignField: '_id',
                as: 'category'
            }
        },
        {
            $unwind: "$category"
        }
    ]);

    let query = req.query.q;

    if (query) {

        // searching
        Products = Products.filter((product) => {
            query = query.toLowerCase().replace(/\s/g, '');
            //checking in product name 
            const name = product.product_name.toLowerCase().replace(/\s/g, '');
            if (name.includes(query)) {
                return true;
            } else if (query.includes(name)) {
                return true;
            }

            // checking in brand
            const brand = product.brand_name.toLowerCase().replace(/\s/g, '');
            if (brand.includes(query)) {
                return true;
            } else if (query.includes(brand)) {
                return true;
            }

            // checking in color
            const color = product.color.toLowerCase().replace(/\s/g, '');
            if (color.includes(query)) {
                return true;
            } else if (query.includes(color)) {
                return true;
            }

            // search in categories 
            const category = product.category.cat_name.toLowerCase().replace(/\s/g, '');
            if (category.includes(query)) {
                return true;
            } else if (query.includes(category)) {
                return true;
            }
        });
    }

    const userData = res.locals.userData;
    let cartCount;
    if (userData) {
        cartCount = userData.cart.length
    }

    res.render('user/products', { user: true, cartCount, Products, footer: true })
}

module.exports = {
    get_searchedProducts
}