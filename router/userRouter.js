const express = require('express')
const route = express()


// requiring user Schema
const userSchema = require('../model/userModel') 

// requiring  user controllers

const userController = require('../controller/userController')



// get methods

route.get('/',userController.loadGest)

route.get('/home',userController.loadHome)

route.get('/product',userController.loadProduct)

route.get('/cart',userController.loadCart)

route.get('/contact',userController.loadContact)

route.get('/shop',userController.loadShop)

route.get('/login',userController.loadLogin)

route.get('/register',userController.loadRegister)

// post methods

route.post('/register',userController.registerUser)








module.exports = route