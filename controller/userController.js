const userSchema = require('../model/userModel')

const bcrypt = require('bcrypt')

// page rendering functions
loadHome=(req,res)=>{
    const session = req.session.user_id
    res.render('home',{session})    
}


loadCart=(req,res)=>{
    const session = req.session.user_id
    res.render('cart',{session})
}
loadShop=(req,res)=>{
    const session = req.session.user_id
    res.render('shop',{session})
}

loadProduct=(req,res)=>{
    const session = req.session.user_id
    res.render('productDetails',{session})
}

loadContact=(req,res)=>{
    const session = req.session.user_id
    res.render('contact',{session})
}

loadLogin=(req,res)=>{
    res.render('login',)
}

loadRegister=(req,res)=>{
    res.render('register',)
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
        await user.save().then(()=>console.log("user Saved successfully"))

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
    loadHome,
    loadContact,
    loadProduct,
    loadCart,
    loadShop,
    loadLogin,
    loadRegister,
    registerUser,
    verifyLogin,
    
}