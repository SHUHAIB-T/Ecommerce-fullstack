const Category = require('../models/categoryModel')


const crateCategory = async (req, res) => {
    const category = await Category.findOne({cat_name: req.body.cat_name})
    if(category){
        req.flash('error', 'Category Already Exist!')
        res.redirect('/admin/categories/new-category')
    }else{
        const newCategory = await Category.create(req.body)
        req.flash('success', 'New Category Added Succefully')
        res.redirect('/admin/categories')
    }
}


const render_Edit_Category = async (req, res) => {
    const admin = res.locals.admin
    const category = await getcategory(req.params.id).then((category) => category)
    res.render('category/edit-category', { admin: true, Admin: admin, category: category })
}

const getcategory = (cat_id) => {
    return new Promise(async (resolve, reject) => {
        const category = await Category.findById(cat_id);
        resolve(category)
    })
}

const UpdateCategory = async (req, res) => {
    let category = await getcategory(req.body._id).then((category) => category)
    if (category) {
        const id = req.body._id
        delete req.body._id
        const newData = req.body
        const updated = await Category.findOneAndUpdate({ _id: id }, newData, { new: true })
        req.flash('success', 'Category Updated Successfully');
        res.redirect('/admin/categories')
    }
}

//get all categories
const getAllCategories = async () => {
    const categories = await Category.find({ delete: false })
    return categories
}

const delete_category = async (req, res) => {
    let category = await getcategory(req.params.id).then((category) => category)
    if (category) {
        let id = req.params.id
        const updated = await Category.findOneAndUpdate({ _id: id }, { delete: true }, { new: true })
        req.flash('success', 'Category Deleted successfully');
        res.redirect('/admin/categories')
    }
}

//render category
const render_category_page = async (req, res) => {
    let categories = await getAllCategories()
    categories.map(obj => {
        obj._doc.createdAt = new Date(obj._doc.createdAt).toLocaleString();
        return obj;
    });
    const admin = res.locals.admin
    res.render('category/category', { admin: true, categories: categories, Admin: admin, success: req.flash('success')[0] })
}

//render new category form
const render_new_category = (req, res) => {
    const admin = res.locals.admin
    res.render('category/new-category', { admin: true, Admin: admin, error:req.flash('error')[0] })
}


//export all functions
module.exports = {
    crateCategory,
    UpdateCategory,
    getcategory,
    render_category_page,
    render_Edit_Category,
    render_new_category,
    delete_category,
    getAllCategories
}