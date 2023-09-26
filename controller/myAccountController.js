const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const Address = require('../models/addressModel');

//render my account
const render_my_Account = async (req, res) => {
    let userData = res.locals.userData
    res.render('myAccount/my-account', { user: true, User: true, userData, success: req.flash('success')[0], footer: true })
}

//render edit user deatails
const render_edit_page = async (req, res) => {
    let userData = await User.findById(req.params.id)
    res.render('myAccount/edit-user', { user: true, User: true, userData, footer: true })
}

const update_detals = async (req, res) => {
    let id = req.params.id
    let data = req.body
    const update = await User.findByIdAndUpdate({ _id: id }, data, { new: true });
    req.flash('success', 'Details Updated Successfully');
    res.json({
        success: true
    })
}

//verify Password
const verify_pass = async (req, res) => {
    let id = req.params.id;
    const user = await User.findById({ _id: id })

    const checkPass = await bcrypt.compare(req.body.password, user.user_password);

    if (checkPass) {
        res.json({
            success: true
        })
    } else {
        res.json({
            success: false,
            msg: "password does not matching!"
        })
    }
}

//update Password
const updateNewPass = async (req, res) => {
    let id = req.params.id;
    let password = req.body.user_password
    let newPass = await bcrypt.hash(password, 10);
    let updatePass = await User.updateOne({ _id: id }, { user_password: newPass });
    if (updatePass) {
        req.flash('success', 'Password Updated Successfully');
        res.json({
            success: true
        })
    }
}

//add new Adress to User
const add_new_address = async (req, res) => {
    await Address.create(req.body);
    req.flash('success', 'Address added Succeccfull')
    res.redirect('/my-account/my-address');
}

//add new Adress to User from ckeckout
const add_new_address_checkout = async (req, res) => {
    await Address.create(req.body);
    res.redirect('/checkout');
}

//viewAddress
const render_Address = async (req, res) => {
    let id = res.locals.userData._id;
    let userData = res.locals.userData;
    const address = await Address.find({ customer_id: id, delete: false });
    res.render('myAccount/myAddress', { user: true, User: true, address, userData, success: req.flash('success')[0], footer: true })

}


//render edit address form
const render_edit_address = async (req, res) => {
    let id = req.params.id;
    const address = await Address.findOne({ _id: id });
    res.render('myAccount/edit_address', { user: true, User: true, address, footer: true })
}


//update user address 
const update_user_address = async (req, res) => {
    let id = req.params.id;
    let data = req.body;
    const updateAddress = await Address.findOneAndUpdate({ _id: id }, data, { new: true });
    req.flash('success', 'address updated successfully');
    res.redirect('/my-account/my-address');
}

//delete address 
const delete_address = async (req, res) => {
    let id = req.params.id;
    const address = await Address.findOneAndUpdate({ _id: id }, { delete: true }, { new: true });
    req.flash('success', 'Address Deleted');
    res.redirect('/my-account/my-address');
}

//render wishlist
const show_wishlist = async (req, res) => {
    let user_id = res.locals.userData._id;
    const wishList = await User.aggregate([
        { $match: { _id: user_id } },
        { $project: { wish_list: 1, _id: 0 } },
        { $unwind: { path: '$wish_list' } },
        {
            $lookup: {
                from: 'products',
                localField: 'wish_list.product_id',
                foreignField: '_id',
                as: 'products'
            }
        },
        { $unwind: { path: '$products' } }
    ])
    console.log(wishList)
    res.render('myAccount/wishlist', { user: true, User: true, wishList, footer: true })
}

//remove from wish list
const removefromWishlist = async (req, res) => {
    let user_id = res.locals.userData._id;
    let product_id = req.params.id;
    const wish_list = {
        $pull: {
            wish_list: {
                product_id: product_id,
            }
        }
    }
    const updateWishlist = await User.findOneAndUpdate({ _id: user_id }, wish_list, { new: true });

    if (updateWishlist) {
        res.json({
            success: true
        })
    }
}

module.exports = {
    render_my_Account,
    render_edit_page,
    update_detals,
    verify_pass,
    updateNewPass,
    add_new_address,
    render_Address,
    render_edit_address,
    update_user_address,
    delete_address,
    add_new_address_checkout,
    show_wishlist,
    removefromWishlist
}