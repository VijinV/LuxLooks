const express = require("express");
const route = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
// requiring  user controllers

const userController = require("../controller/userController");

const userAuth = require("../middleware/userAuth");

const config = require("../config/config");

const nocache = require("nocache");

const userMulter = require("../util/userMulter")

const multer = require("../util/multer");

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

route.get("/",userController.loadHome);

route.get("/product",userAuth.isLogout, userController.loadProduct);

route.get("/cart",userAuth.isLogout, userController.loadCart);

route.get("/contact", userController.loadContact);

route.get("/shop", userController.loadShop);

route.get("/login", userAuth.isLogin, userController.loadLogin);

// route.get("/register", userAuth.isLogin, userController.loadRegister);

route.get("/logout", userAuth.logout);

route.get("/productDetails", userController.loadProductDetails);

route.get("/checkout",userAuth.isLogout,userController.loadCheckout)

route.post("/addToCart", userAuth.isLogout,userController.addToCart) ////////////////?

route.get('/deleteCart', userAuth.isLogout,userController.deleteCart)

route.post('/placeOrder',userAuth.isLogout,userController.placeOrder)

route.get('/orderSuccess',userAuth.isLogout, userController.loadOrderSuccess)

route.get('/orderSummary',userAuth.isLogout, userController.loadOrderSummary)

route.post('/addToWishlist',userAuth.isLogout, userController.addToWishlist)

route.get('/wishlist',userAuth.isLogout, userController.loadWishlist)

route.get('/forgetPassword', userController.loadForgetPassword)

route.get('/editAddress', userAuth.isLogout,userController.loadEditAddress)

route.get('/deleteAddress',userAuth.isLogout, userController.deleteAddress)

route.get('/OrderDetails',userAuth.isLogout, userController.loadOrderDetails)

route.get('/deleteWishlist',userAuth.isLogout,userController.deleteWishlist)

route.get('/addCartDeleteWishlist',userAuth.isLogout,userController.addCartDeleteWishlist)

route.get('/userProfile',userAuth.isLogout,userController.loadUserProfile)

 route.get('/editProfile',userAuth.isLogout,userController.loadEditUserProfile)
 
 route.get('/cancelOrder',userAuth.isLogout,userController.cancelOrder)

 route.get('/viewOrder',userAuth.isLogout,userController.viewOrders)

 route.get('/address',userAuth.isLogout,userController.loadAddress)


 route.get('/editMobile',userController.editMobile)

// route.get('editAddress', userController.editAddress)
// route.get('/otp',userController.getOtp)

// post methods
route.post('/editAddress', userAuth.isLogout,userController.editAddress)

route.post('/forgetPassword', userController.forgetPassword)

route.post('/verifyForgetOtp',userController.verifyForgetPassword)

route.post('/changePassword', userController.changePassword)

route.post ("/addAddress", userAuth.isLogout,userController.addAddress)

route.post("/register", userController.registerUser, userController.loadOtp);

route.post("/login", userController.verifyLogin);

route.get("/otp",userController.loadOtp);

route.post('/otp',userController.verifyOtp)

route.post('/editUser',userAuth.isLogout,userMulter.upload,userController.editUserProfile)

route.post('/razorpay',userAuth.isLogout, userController.payment)


module.exports = route;
