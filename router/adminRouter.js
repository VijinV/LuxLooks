const express = require('express');

const router = express();

const adminController = require('../controller/adminController');

const config = require('../config/config');

const session = require('express-session');

const adminAuth = require('../middleware/adminAuth')

const nocache = require('nocache');

const fileUpload = require('../util/multer');
const { route } = require('./userRouter');


router.use(nocache())

router.use(express.json())
router.use(express.urlencoded({ extended: true }))



// const cookieParser  = require('cookie-parser');

// router.use(cookieParser)


router.use(session({
    secret:config.secretKey,
    saveUninitialized:true,
    resave:true,
    cookie:{
        maxAge:config.maxAge,
        
    }
}))




router.get('/',adminAuth.isLogin,adminController.loadLogin)

router.get('/products', adminAuth.isLogout,adminController.loadProduct)

router.get('/addProducts', adminAuth.isLogout,adminController.loadAddProduct)

router.get('/users', adminAuth.isLogout,adminController.loadUsers)

router.get('/dashboard', adminAuth.isLogout,adminController.loadDashboard)

router.get('/logout', adminAuth.logout)

router.get('/editProduct',adminController.loadEditProduct)

router.get('/block',adminController.blockUser)

router.get('/stock',adminController.inStock)




// post 

router.post('/', adminController.verifyLogin)

router.post('/addProducts',adminController.upload,adminController.addProduct, adminController.loadAddProduct)


router.post('/update',adminController.editProduct)


module.exports = router
