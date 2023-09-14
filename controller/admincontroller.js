const session = require('express-session');
const jwt = require('jsonwebtoken')
const { transporter } = require('../config/mailConnect')
const OTP = require('../models/otpModel')
const bcrypt = require('bcrypt')
const Admin = require('../models/adminModel')

//render dashboard
const render_dharboard = (req, res) => {
    const admin = res.locals.admin
    res.status(500).render('admin/admin-dash', { Admin: admin })
}
//redirect to dash board
const redirect_dash = (req, res) => {
    res.redirect('/admin/dash')
}

//reder login page
const render_login = async (req, res) => {
    const token = req.cookies.adminTocken;
    if (token) {
        await jwt.verify(token, process.env.SECRET_KEY, (err, decodeded) => {
            if (err) {
                res.render('admin/admin-login', { fullscreen:true,admin: true, error:req.flash('error')[0], success:req.flash('success')[0] })
                delete req.session.err
            } else {
                res.redirect('/admin/dash')
            }
        })
    } else {
        res.render('admin/admin-login', { fullscreen:true,admin: true, error:req.flash('error')[0],success:req.flash('success')[0] })
    }

}

//render forget password page
const render_forget_pass = (req, res) => {
    res.render('admin/forgetpass', { fullscreen:true,admin: true, err: req.session.otp_err })
}

const getRandomSixDigitNumber = () => {
    // Generate a random 6-digit number
    return Math.floor(100000 + Math.random() * 900000);
}

const send_otp = async (req,res) => {

    res.json(req.body.email)
    // Define email data
    const otp = getRandomSixDigitNumber();
    const mail = req.body.email
    await OTP.create({email:mail,otp:otp})
    const mailOptions = {
        from: 'timescart11@gmail.com', // Sender's email address
        to: mail, // Recipient's email address
        subject: 'Hello Welcome to Times cart', // Email subject
        text:`this is you otp fo verification ${otp}` // Email content (plain text)
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
    const email = req.body.email
    const otp = req.body.otp;
    const user =  await OTP.findOne({email:email})
    console.log(user)
    if(user){
        if(otp == user.otp){
            req.session.email = email;
            res.json({success:true})
        }else{
            res.json({msg:"the OTP is Invalid or Expired"})
        }
    }
}

const render_rest_pass =  (req,res) => {
    res.render('admin/reset-pass',{fullscreen:true,admin:true})
}
const update_password = async(req,res) => {
    let password = req.body.password[0]
    let newPass = await bcrypt.hash(password,10)
    let admin = await Admin.findOne({email:req.session.email})
    if(admin){
        await Admin.updateOne({email:req.session.email},{password:newPass})
        req.flash('success','Password Updated Succerfully');
        res.redirect('/admin/login')
    }
}

module.exports = {
    render_login,
    render_dharboard,
    redirect_dash,
    render_forget_pass,
    send_otp,
    veryfy_otp ,
    render_rest_pass,
    update_password,
}