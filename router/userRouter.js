const express = require('express')
const route = express()
const session = require('express-session')
const cookieParser = require('cookie-parser')

// requiring user Schema
const userSchema = require('../model/userModel') 

// requiring  user controllers

const userController = require('../controller/userController')

const userAuth = require('../middleware/userAuth')

const config = require('../config/config')

route.use(cookieParser())

//session
route.use(session({
    secret:config.secretKey,
    saveUninitialized:true,
    resave:true,
    cookie:{
        maxAge:config.cookieMaxAge,
        
    }
}))

 
// get methods

route.get('/',userController.loadHome)

route.get('/product',userController.loadProduct)

route.get('/cart',userController.loadCart)

route.get('/contact',userController.loadContact)

route.get('/shop',userController.loadShop)

route.get('/login',userAuth.isLogin,userController.loadLogin)

route.get('/register',userAuth.isLogin,userController.loadRegister)

route.get('/logout',userAuth.logout)

// post methods

route.post('/register',userController.registerUser,userController.loadHome)

route.post('/login',userController.verifyLogin)







module.exports = route