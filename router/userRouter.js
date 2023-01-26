const express = require('express')
const route = express()
const session = require('express-session')
const cookieParser = require('cookie-parser')
// requiring  user controllers

const userController = require('../controller/userController')

const userAuth = require('../middleware/userAuth')

const config = require('../config/config')

const nocache = require('nocache');


route.use(nocache())

route.use(cookieParser())

//session
route.use(session({
    secret:config.secretKey,
    saveUninitialized:true,
    resave:true,
    cookie:{
        maxAge:config.maxAge,
        
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

route.get('/productDetails',userController.loadProductDetails,)

route.get('/otp',userController.getOtp)

// post methods

route.post('/register',userController.saveUser)

route.post('/login',userController.verifyLogin)

route.post('/otp',userController.addUser)







module.exports = route