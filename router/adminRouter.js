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

router.get("/editProduct", adminController.loadEditProduct);

router.get("/block", adminController.blockUser);

router.get("/stock", adminController.inStock);

router.get('/category', adminController.loadCategory)

router.get('/deleteCategory', adminController.deleteCategory)

router.get('/order', adminController.loadOrders)

router.get('/cancelOrder', adminController.cancelOrder)

router.get('/confirmOrder', adminController.ConfirmOrder)

// post

router.post("/", adminController.verifyLogin);

// router.post ('/addCategory', adminController.addCategory,adminController.loadCategory)


router.post('/category',adminController.addCategory)


router.post(
  "/addProducts",
  multer.upload.array("images"),
  adminController.addProduct,
  adminController.loadAddProduct
);

router.post("/update", multer.upload.array("image"), adminController.editProduct);

module.exports = router; 
