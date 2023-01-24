const userModel = require('../model/userModel')
const ProductModel = require('../model/productModel')
const bcrypt = require('bcrypt');
const productModel = require('../model/productModel');
const path = require('path');
const multer = require('multer');


// !--------------multer-----------------------------------------------
const Storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/productImages')
    },
    filename:(req,file,cb)=>{
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
    }
})

const upload =multer({
    storage:Storage
}).single('images')

// !----------------------------------------------------------------

// get meathodes
loadDashboard =(req,res)=>{
    res.render('dashboard')
}

loadProduct =(req,res)=>{
    
    res.render('product')
}

loadAddProduct =(req,res)=>{
 

    res.render('addProduct')
}

loadUsers =(req,res)=>{
    
    res.render('users')
}

loadLogin =(req,res)=>{
    const logout = true;
    res.render('login',{logout})
}


// post meathode


const verifyLogin = async (req,res)=>{

try {

    const email = req.body.email

    const userData = await userModel.findOne({ email: email})

    

    if (userData) {
        const passwordMatch = await bcrypt.compare(req.body.password,userData.password)
    

        if (passwordMatch) {

            if (userData.isAdmin) {

                req.session.admin_id = userData._id
                req.session.admin_name = userData.name

                res.redirect('/admin')
                
            } else {

                res.render('login',{message:'You are not an administrator'})
                
            }
            
        } else {

            res.render('login',{message:'password is invalid'})
            
        }
        
    } else {
        
        res.render('login',{message:'Account not found'})

    }

    
} catch (error) {

    console.log(error.message);
    
}
}


const addProduct = async (req, res,next) => {

    try {

        const product = new productModel({
            name:req.body.product,
            category:req.body.category,
            price:req.body.price,
            image:req.file.filename,
            description:req.body.description,
            isAvailable:true,
        })
        
       await product.save().then(() => console.log('Product Saved'))

       next()
        
    } catch (error) {

        console.log(error.message);
        
    }

}





module.exports = {
   loadDashboard,
   loadProduct,
   loadAddProduct,
   loadUsers,
   loadLogin,
   verifyLogin,
   addProduct,
   upload

} 