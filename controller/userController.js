const userSchema = require('../model/userModel')
const produtModel = require('../model/productModel')

const bcrypt = require('bcrypt')


const message = require('../config/sms')


// !================================================================================

const getOtp=(req,res)=>{
     res.render('otp')
  }
//   ?================================================================
 const  saveUser=async(req,res)=>{
    console.log('1');
    const check = req.body.email
    const storeuser =({
       username : req.body.name,
       email : req.body.email,
       number :req.body.mobile,
       password : req.body.password
      })
    req.session.storeuser= storeuser

    console.log(storeuser)
    console.log(req.body.mobile)
   
//  ?================================================================

    const email = await userSchema.find({email:req.body.email})
    const number = await userSchema.find({number:req.body.mobile})
    console.log(number);
    console.log(email);
    if(email.length==0){
       if  (number.length!=0){
           req.session.message="Number already exist"
       return res.redirect('/register')
    }else{
           try{
          await message.sentotp(req.session.storeuser.number)
           res.redirect('./otp')
       }
       catch{
          console.log ("err")
       }
    }
 } 
 else {
    req.session.message="Email already exist"
      return res.redirect('/register')
    }
  }
 

  
 const addUser=async(req,res)=>{
 try{
    const storeuser = new Register ({
       username : req.session.storeuser.username,
       email : req.session.storeuser.email,
       number : req.session.storeuser.number,
       password : req.session.storeuser.password
    })
    const otp =req.body.otp
       
    if(otp.length==0){
       req.session.message="Enter otp"
        return res.redirect('/otp')
    }
    else {
       const check =await message.check(otp,req.session.storeuser.number)
       if(check.status=="approved"){
          storeuser.password =await bcrypt.hash(storeuser.password,10)
          await storeuser.save()
          //req.session.storeuser=null
          req.session.message=""
          res.redirect('./login',)
       }
       else{
          req.session.message = "Invalid otp"
          res.redirect('/otp')
       }
    }
 }
 catch (err){
    console.log(err)
 
 } 
 },

// !================================================================================



// page rendering functions
loadHome=(req,res)=>{
    const session = req.session.user_id
    const login = false
    res.render('home',{session,login})    
}


loadCart=(req,res)=>{
    const session = req.session.user_id
    const login = false
    res.render('cart',{session,login})
}
const loadShop= (req,res)=>{
    const session = req.session.user_id
    const login = false
     produtModel.find({}).exec((err,product)=>{

        if (product) {

            res.render('shop',{session,product,login})
            
        } else {

            res.render('shop',{session,login})
            
        }
    })

   
    
}

loadProduct=(req,res)=>{
    const session = req.session.user_id
    const login = false
    res.render('productDetails',{session,login})
}

loadContact=(req,res)=>{
    const session = req.session.user_id
    const login = false
    res.render('contact',{session,login})
}

loadLogin=(req,res)=>{
    const login = true
    res.render('login',{login})
}

loadRegister=(req,res)=>{
    const login = true
    res.render('register',{login})
}

loadProductDetails = async(req,res)=>{
    const login = false
   try {
	 const session = req.session.user_id

     console.log(req.query.id);
	
	   const product =await produtModel.findById({_id:req.query.id})
	
	    res.render('productDetails',{product,session,login})
} catch (error) {

    console.log(error.message);
	
}
}

// register user

const registerUser =async (req,res,next)=>{

    try {
        const password = await bcrypt.hash(req.body.password,10)
        const user =  new userSchema({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: password,
            isAdmin: false,
            isAvailable:true
        })
        await user.save().then(()=>{
            req.session.user_id = req.body.name
        })

        next()

    } catch (error) {
        console.log(error.message)
    }

}

const verifyLogin = async(req,res,next)=>{
    try {
        const email =req.body.email
        const userData = await  userSchema.findOne({email})
        

        if(userData){
            const passwordMatch = await bcrypt.compare(req.body.password,userData.password)
            


            if(passwordMatch){
            

                if (userData.isAvailable) { 

                    req.session.user_id = userData._id
                    req.session.user_name = userData.name
                    res.redirect('/')
                    
                } else {

                    res.render('login',{message:'You are Blocked by the administrator'})

                    
                }

            }else{

                res.render('login',{message:'Invalid password'})
                
            }

    
        }else{
            res.render('login',{message:'Accout not found'})
        }
    } catch (error) {
        console.log(error.message)
    }
}








 



module.exports = {
    loadProductDetails ,
    loadHome,
    loadContact,
    loadProduct,
    loadCart,
    loadShop,
    loadLogin,
    loadRegister,
    registerUser,
    verifyLogin,
    saveUser,
    getOtp,
    addUser   
}