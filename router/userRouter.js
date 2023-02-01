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

route.get("/cart", userController.loadCart);

route.get("/contact", userController.loadContact);

route.get("/shop", userController.loadShop);

route.get("/login", userAuth.isLogin, userController.loadLogin);

route.get("/register", userAuth.isLogin, userController.loadRegister);

route.get("/logout", userAuth.logout);

route.get("/productDetails", userController.loadProductDetails);

route.get("/address",userController.loadAddress)

// route.get('/otp',userController.getOtp)

// post methods

route.post("/register", userController.registerUser, userController.loadOtp);

route.post("/login", userController.verifyLogin);

route.get("/otp",userController.loadOtp);

route.post('/otp',userController.verifyOtp)

module.exports = route;
