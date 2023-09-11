const adminModel = require('../models/adminModel')
const Category = require('../models/categoryModel')
const mongoose = require('mongoose')

const crateCategory = async (req,res) => {
    const newCategory = await Category.create(req.body)
    res.json(newCategory)
}

const render_Edit_Category = async (req,res) => {
    const admin = res.locals.admin
    const category = await getcategory(req.params.id).then((category) => category)
    console.log(category.cat_name)
    res.render('admin/edit-category',{admin:true,Admin:admin, category:category})
}

const getcategory = (cat_id) => {
    return new Promise(async (resolve,reject) => {
        const category = await Category.findById(cat_id);
        resolve(category)   
    })
}

const UpdateCategory = async (req,res) => {
    let category = await getcategory(req.body._id).then((category) => category)
    if(category){
        const id = req.body._id
        delete req.body._id
        const newData = req.body
        console.log(newData)
        console.log(id)
        const updated = await Category.findOneAndUpdate({_id:id},newData,{new:true})
        req.flash('success','Category Updated Successfully');
        res.redirect('/admin/categories')
    }
}

//get all categories
const getAllCategories = async() => {
    const categories = await Category.find()
    return categories
}


//render category
const render_category_page = async (req,res) =>{
    let categories = await getAllCategories()
    const admin = res.locals.admin
    console.log(categories)
    res.render('admin/category',{admin:true, categories:categories, Admin: admin , success:req.flash('success')[0]})
}

module.exports = {
    crateCategory,
    UpdateCategory,
    getcategory,
    render_category_page,
    render_Edit_Category
}