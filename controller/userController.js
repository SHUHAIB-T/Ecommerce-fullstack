const OTP = require('../models/otpModel')
const { transporter } = require('../config/mailConnect');
const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const Product = require('../models/productModel');
const jwt = require('jsonwebtoken');


//render home
const render_home = async (req,res) => {
    const product = await Product.find()
    const userData = res.locals.userData;
    res.render('user/home',{user:true,userData, product, footer:true})
}

//render user login page
const render_user_login = async (req,res) =>{
    let token = req.cookies.userTocken;
    await jwt.verify(token,process.env.SECRET_KEY, async (err, decodedTocken) => {
        if(err){
            res.render('user/login-page',{user:true,fullscreen : true , User:false,error:req.flash('error')[0], success: req.flash('success')[0], err:req.session.err})
            delete req.session.err;
        }else{
            res.redirect('/')
        }
    })
}

//render siognUp page
const render_SignUp = (req,res) => {
    res.render('user/signup-page',{fullscreen:true})
}

const getRandomSixDigitNumber = () => {
    // Generate a random 6-digit number
    return Math.floor(100000 + Math.random() * 900000);
}

//veryfy using OTP
const genarate_otp = async (req,res) => {

    res.json(req.body.user_email)
    // Define email data
    const otp = getRandomSixDigitNumber();
    const mail = req.body.user_email
    await OTP.create({email:mail,otp:otp})
    const mailOptions = {
        from: 'timescart11@gmail.com', 
        to: mail, 
        subject: 'Hello Welcome to Times cart',
        text:`This is your OTP fo verification ${otp}` 
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}


//verify otp
const veryfy_otp = async (req,res) => {
    const email = req.body.user_email
    const otp = req.body.otp;
    const user =  await OTP.findOne({email:email})
    if(user){
        if(otp == user.otp){
            delete req.body.otp
            const checkUser = await User.findOne({user_email:req.body.user_email})
            if(checkUser){
                res.json({err:"Email Already Exist"})
            }else{
                req.body.user_password = await bcrypt.hash(req.body.user_password,10);
                await User.create(req.body);
                req.flash('success','Sign Up Succefull')
                res.json({success:true})
            }
        }else{
            res.json({msg:"OTP is Invalid or Expired !"})
        }
    }
}

//show product details
const show_product_details = async (req,res) =>{
    const product = await Product.findById(req.params.id)
    res.render('user/product-deatils',{user:true,fullscreen:true, product, footer:true})
}

module.exports = {
    render_user_login,
    render_SignUp,
    genarate_otp,
    veryfy_otp,
    render_home,
    show_product_details
}