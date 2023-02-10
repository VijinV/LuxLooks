const express = require("express");
const route = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
// requiring  user controllers

const userController = require("../controller/userController");

const userAuth = require("../middleware/userAuth");

const config = require("../config/config");

const nocache = require("nocache");

// ! sms

const sms = require("fast2sms");
const otp = Math.floor(1000 + Math.random() * 9000);
// !================================================

route.use(nocache());

route.use(cookieParser());

//session
route.use(
  session({
    secret: config.secretKey,
    saveUninitialized: true,
    resave: true,
    cookie: {
      maxAge: config.maxAge,
    },
  })
);

// get methods

route.get("/", userController.loadHome);

route.get("/product", userController.loadProduct);

route.get("/cart",userAuth.isLogout, userController.loadCart);

route.get("/contact", userController.loadContact);

route.get("/shop", userController.loadShop);

route.get("/login", userAuth.isLogin, userController.loadLogin);

// route.get("/register", userAuth.isLogin, userController.loadRegister);

route.get("/logout", userAuth.logout);

route.get("/productDetails", userController.loadProductDetails);

route.get("/checkout",userAuth.isLogout,userController.loadCheckout)

route.get("/addToCart", userAuth.isLogout,userController.addToCart)

route.get('/deleteCart', userController.deleteCart)

route.post('/placeOrder',userController.placeOrder)

route.get('/orderSuccess', userController.loadOrderSuccess)

route.get('/orderSummary', userController.loadOrderSummary)

route.get('/addToWishlist', userController.addToWishlist)

route.get('/wishlist', userController.loadWishlist)

route.get('/forgetPassword', userController.loadForgetPassword)

route.get('/editAddress', userController.loadEditAddress)

route.get('/deleteAddress', userController.deleteAddress)

route.get('/OrderDetails', userController.loadOrderDetails)

route.get('/deleteWishlist',userController.deleteWishlist)

route.get('/addCartDeleteWishlist',userController.addCartDeleteWishlist)

route.get('/userProfile',userController.loadUserProfile)

 

// route.get('editAddress', userController.editAddress)
  
// route.get('/otp',userController.getOtp)

// post methods
route.post('/editAddress', userController.editAddress)
route.post('/forgetPassword', userController.forgetPassword)

route.post('/verifyForgetOtp',userController.verifyForgetPassword)

route.post('/changePassword', userController.changePassword)

route.post ("/addAddress", userController.addAddress)

route.post("/register", userController.registerUser, userController.loadOtp);

route.post("/login", userController.verifyLogin);

route.get("/otp",userController.loadOtp);

route.post('/otp',userController.verifyOtp)

module.exports = route;
