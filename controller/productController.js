//requiring Product Schema
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const { getAllCategories } = require('./categoryController')
const mongoose = require('mongoose')
const { json } = require('body-parser')

//add product function 
const add_product = async (req, res) => {
    try {
        let seconaryImages = []
        req.files.images.forEach((e) => {
            seconaryImages.push({
                name: e.filename,
                path: e.path
            })
        });

        let PrimaryImage ;
        req.files.primaryImage.forEach((e) => {
            PrimaryImage = {
                name:e.filename,
                path:e.path
            }
        });
        
        const product = new Product({
            product_name: req.body.product_name,
            brand_name: req.body.brand_name,
            description: req.body.description,
            category_id: req.body.category,
            stock: req.body.stock,
            actual_price: req.body.prod_price,
            selling_price: req.body.sellig_price,
            color: req.body.color,
            GST: req.body.GST,
            primary_image: PrimaryImage,
            secondary_images: seconaryImages
        })
        const saved = await product.save()
        req.flash('success', 'New product Added Sucessfully');
        res.redirect('/admin/products')
    } catch (error) {
        res.status(400).send(error)
    }
}


//render add Product 
const render_product_page = async (req, res) => {
    const admin = res.locals.admin;
    const products = await getAllProducts()
    res.render('product/product', { Admin: admin, products, success: req.flash('success')[0], error: req.flash('false')[0] })
}

//get all Product 
const getAllProducts = async () => {
    const products = await Product.aggregate([
        {
            $match: {
                delete: false
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
            $unwind: '$category'
        },
        {
            $match: {
                'category.cat_status': true,
                'category.delete': false
            }
        },
        {
            $project: {
                _id: 1,
                product_name: 1,
                brand_name: 1,
                stock: 1,
                primary_image: 1,
                'category.cat_name': 1,
                selling_price: 1,
                status: 1,
                description: 1
            }
        }
    ]);
    return products;
}


//render new product form 
const render_new_product = async (req, res) => {
    const admin = res.locals.admin
    const category = await getAllCategories()
    res.render('product/new-product', { fullscreen: true, Admin: admin, category: category })
}

//find Product Function
const findProduct = async (product_id) => {
    const product = await Product.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(product_id)
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
            $unwind: '$category'
        },
        {
            $match: {
                'category.cat_status': true,
                'category.delete': false
            }
        },
        {
            $project: {
                _id: 1,
                product_name: 1,
                brand_name: 1,
                stock: 1,
                primary_image: 1,
                'category.cat_name': 1,
                'category._id': 1,
                selling_price: 1,
                actual_price: 1,
                color: 1,
                status: 1,
                description: 1,
                GST: 1,
                primary_image: 1,
                secondary_images: 1
            }
        }
    ])
    return product
}

const getCategory = async (name) => {
    const categories = await Category.find({ cat_name: { $ne: name } })
    return categories
}


//reneder edit product page
const render_edit_product = async (req, res) => {
    const product = await findProduct(req.params.id)
    const obj = product[0]
    const category = await getCategory(obj.category.cat_name)
    res.render('product/edit-product', { admin: true, obj, category: category })
}

//update product
const update_product = async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.body.id });
        if (req.files != null) {
            const id_secondary_img = req.body.id_secondary_img
            const primaryImage = product.primary_image

            const primaryimagejs = req.files.primaryImage
            if (primaryimagejs) {
                primaryImage[0].name = primaryimagejs[0].filename
                primaryImage[0].path = primaryimagejs[0].path
            }

            const secondaryImage = product.secondary_images
            const secodaryimagejs = req.files.images

            if (secodaryimagejs) {

                for (let i = 0; i < secodaryimagejs.length; i++) {
                    if (id_secondary_img[i] == secondaryImage[i]._id) {
                        secondaryImage[i].name = secodaryimagejs[i].filename;
                        secondaryImage[i].path = secodaryimagejs[i].path;
                    }
                }

            }
        }

        const categoryID = new mongoose.Types.ObjectId(req.body.category)
        product.product_name = req.body.product_name;
        product.brand_name = req.body.brand_name;
        product.description = req.body.description;
        product.category_id = categoryID;
        product.stock = req.body.stock;
        product.actual_price = req.body.prod_price;
        product.selling_price = req.body.sellig_price;
        product.color = req.body.color;
        product.GST = req.body.GST;
        product.status = req.body.status;

        const productUpadate = await Product.findByIdAndUpdate({ _id: req.body.id }, product)
        req.flash('success', 'product editted successfully')
        res.redirect('/admin/products')
    } catch (err) {
        console.log(err)
    }

}

//delete product 
const deleteProduct = async (req, res) => {
    await Product.findByIdAndUpdate({ _id: req.params.id }, { delete: true });
    req.flash('success', 'Poduct Deleted successfully');
    res.redirect('/admin/products')
}



module.exports = {
    render_product_page,
    render_new_product,
    add_product,
    render_edit_product,
    update_product,
    deleteProduct
}