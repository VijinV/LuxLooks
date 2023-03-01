const express = require("express");

const router = express();

const adminController = require("../controller/adminController");

const config = require("../config/config");

const session = require("express-session");

const adminAuth = require("../middleware/adminAuth");  

const nocache = require("nocache");

const multer = require("../util/multer");

router.use(nocache());

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// const cookieParser  = require('cookie-parser');

// router.use(cookieParser)

router.use(
  session({
    secret: config.secretKey,
    saveUninitialized: true,
    resave: true,
    cookie: {
      maxAge: config.maxAge,
    },
  })
);

router.get("/", adminAuth.isLogin, adminController.loadLogin);

router.get("/products", adminAuth.isLogout, adminController.loadProduct);

router.get("/addProducts", adminAuth.isLogout, adminController.loadAddProduct);

router.get("/users", adminAuth.isLogout, adminController.loadUsers);

router.get("/dashboard", adminAuth.isLogout, adminController.loadDashboard);

router.get("/logout", adminAuth.logout);

router.get("/editProduct",adminAuth.isLogout, adminController.loadEditProduct);

router.get("/block", adminAuth.isLogout,adminController.blockUser);

router.get("/stock",adminAuth.isLogout, adminController.inStock);

router.get('/category',adminAuth.isLogout,adminAuth.isLogout, adminController.loadCategory)

router.get('/deleteCategory',adminAuth.isLogout, adminController.deleteCategory)

router.get('/order',adminAuth.isLogout, adminController.loadOrders)

router.get('/cancelOrder',adminAuth.isLogout, adminController.cancelOrder)

router.get('/confirmOrder',adminAuth.isLogout, adminController.ConfirmOrder)

router.get('/deliOrder',adminAuth.isLogout, adminController.deliOrder)

router.get('/returnOrder',adminAuth.isLogout, adminController.returnOrder)

router.get('/viewOrder',adminAuth.isLogout, adminController.viewOrder)

router.get('/coupon',adminAuth.isLogout,adminController.loadCoupon)

// post

router.post("/", adminController.verifyLogin);

// router.post ('/addCategory', adminController.addCategory,adminController.loadCategory)


router.post('/category',adminAuth.isLogout,adminController.addCategory)


router.post(
  "/addProducts",adminAuth.isLogout,
  multer.upload.array("images"),
  adminController.addProduct,
  adminController.loadAddProduct
);

router.post("/update",adminAuth.isLogout, multer.upload.array("image"), adminController.editProduct);

router.post('/addCoupon',adminAuth.isLogout,adminController.addCoupon)

module.exports = router; 
