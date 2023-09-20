const User = require('../models/userModel')

//listing all customers
const show_all_customers = async (req,res) => {
    let customer = await User.find();
    customer.map(obj => {
        obj._doc.createdAt = new Date(obj._doc.createdAt).toLocaleString();
        return obj;
    });
    console.log(customer)
    const Admin = res.locals.admin;
    res.render('customers/customers',{admin:true, Admin,customer, success:req.flash('success')[0]})
} 


//render edit page

const customer_block = async (req,res) => {
    const customer = await User.findByIdAndUpdate({_id:req.params.id},{user_status:false})
    req.flash('success','User Blocked');
    res.redirect('/admin/customers')
}

const customer_unblock = async (req,res) => {
    const customer = await User.findByIdAndUpdate({_id:req.params.id},{user_status:true})
    req.flash('success','User Unblocked');
    res.redirect('/admin/customers')
}


module.exports = {
    show_all_customers,
    customer_block,
    customer_unblock
}