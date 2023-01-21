const userSchema = require('../model/userModel')

const bcrypt = require('bcrypt')

// page rendering functions
loadHome=(req,res)=>{
    res.render('home')
}

loadGest=(req,res)=>{
    res.render('guest')
}

loadCart=(req,res)=>{
    res.render('cart')
}
loadShop=(req,res)=>{
    res.render('shop')
}

loadProduct=(req,res)=>{
    res.render('productDetails')
}

loadContact=(req,res)=>{
    res.render('contact')
}

loadLogin=(req,res)=>{
    res.render('login')
}

loadRegister=(req,res)=>{
    res.render('register')
}

// register user

const registerUser = (req,res)=>{

}























module.exports = {
    loadHome,
    loadContact,
    loadProduct,
    loadGest,
    loadCart,
    loadShop,
    loadLogin,
    loadRegister,
    registerUser
}