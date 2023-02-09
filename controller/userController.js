const bcrypt = require("bcrypt");
let newOtp;

const userSchema = require("../model/userModel");
const message = require("../config/sms");
const productModel = require("../model/productModel");
const Address = require("../model/addressModel");
const Order = require("../model/orderModel");
const addressModel = require("../model/addressModel");
const userModel = require("../model/userModel");
const orderModel = require("../model/orderModel");

let newUser;


loadHome = (req, res) => {
  const session = req.session.user_id;
  const login = false;

  productModel.find({}).exec((err, product) => {
    if (product) {
      res.render("home", { session, product, login });
    } else {
      res.render("home", { session, login });
    }
  });
}
// !================================================================
const loadCart = async (req, res) => {
  try {
    const login = false;
    userSession = req.session;
    const userData = await userSchema.findById({ _id: userSession.user_id });
    const completeUser = await userData.populate("cart.item.productId");

    res.render("cart", {
      login,
      id:userSession.user_id,
      cartProducts: completeUser.cart.item,
      total:completeUser.cart.totalPrice
    });
  } catch (error) {
    console.log(error);
  }
};


const addToCart = async (req, res, next) => {
  try {

    const productId = req.query.id;
    userSession = req.session;
    const userData = await userSchema.findById({ _id: userSession.user_id });
    const productData = await productModel.findById({ _id: productId });
      await userData.addToCart(productData);
          res.redirect("/shop");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCart = async (req, res, next) => {
  try {
    const productId = req.query.id;
    userSession = req.session;

    const userData = await userSchema.findById({ _id: userSession.user_id });
    await userData.removefromCart(productId);
    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
  }
};




// !================================================================


const addToWishlist = async (req, res) => {
  try {
    const productId = req.query.id;
    console.log(pro);
    userSession = req.session;
    const userData = await userSchema.findById({ _id: userSession.user_id });
    const productData = await productModel.findById({ _id: productId });

    userData.addToWishlist(productData);
    res.redirect("/shop");
  } catch (error) {
    console.log(error.message);
  }
};

loadWishlist = async (req, res) => {


  try {
    userSession = req.session
    const userData = await userSchema.findById({ _id: userSession.user_id });
    const completeUser = await userData.populate("wishlist.item.productId");
    res.render("wishlist", {
      id: userSession.user_id,
      wishlistProducts: completeUser.wishlist.item,
    });

  } catch (error) {

    console.log(error.message);
    
  }




};



const addCartDeleteWishlist = async (req, res) => {
  try {
    userSession = req.session;
    const productId = req.query.id;
    const userData = await User.findById({ _id: userSession.userId });
    const productData = await Product.findById({ _id: productId });
    const add = await userData.addToCart(productData);
    if (add) {
      await userData.removefromWishlist(productId);
    }
    res.redirect("/wishlist");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteWishlist = async (req, res) => {
  try {
    const productId = req.query.id;
    userSession = req.session;
    const userData = await User.findById({ _id: userSession.userId });
    await userData.removefromWishlist(productId);
    res.redirect("/wishlist");
  } catch (error) {
    console.log(error.message);
  }
};

// !================================================================

const loadShop = (req, res) => {
  const session = req.session.user_id;
  const login = false;
  productModel.find({}).exec((err, product) => {
    if (product) {
      res.render("shop", { session, product, login });
    } else {
      res.render("shop", { session, login });
    }
  });
};
 
loadProduct = (req, res) => {
  const session = req.session.user_id;
  const login = false;
  res.render("productDetails", { session, login });
};

loadContact = (req, res) => {
  const session = req.session.user_id;
  const login = false;
  res.render("contact", { session, login });
};

loadLogin = (req, res) => {
  const login = true;
  res.render("login", { login });
};

// loadRegister = (req, res) => {
//   const login = true;
//   res.render("register", { login });
// };

loadProductDetails = async (req, res) => {
  const login = false;
  try {
    const session = req.session.user_id;

    // console.log(req.query.id);

    const product = await productModel.findById({ _id: req.query.id });

    res.render("productDetails", { product, session, login });
  } catch (error) {
    console.log(error.message);
  }
};

// register user

const registerUser = async (req, res, next) => {
  try {
    const userData = await userSchema.findOne({ email: req.body.email });
    const userData1 = await userSchema.findOne({ mobile: req.body.mobile });

    if (userData || userData1) {
      res.render("register", { message: "This Account is already registered" });
    } else {
      newUser = {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        password: req.body.password,
        isAdmin: false,
      };

      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

loadOtp = async (req, res) => {
  const userData = newUser;
  const login = true
  const mobile = userData.mobile;

  newOtp = message.sendMessage(mobile, res);

  console.log(newOtp);
  setTimeout(()=>{
    newOtp = null;
  
  },1)

  res.render("otp", { newOtp, userData
      ,login });
};

const verifyLogin = async (req, res, next) => {
  try {
    const email = req.body.email;

    const userData = await userSchema.findOne({ email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        userData.password
      );

      if (passwordMatch) {
        if (userData.isAvailable) {
          req.session.user_id = userData._id;
          req.session.user_name = userData.name;
          res.redirect("/");
        } else {
          res.render("login", {
            message: "You are Blocked by the administrator",
          });
        }
      } else {
        res.render("login", { message: "Invalid password" });
      }
    } else {
      res.render("login", { message: "Account not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    var otp = req.body.newotp;
console.log(otp);

      if (otp === req.body.otp) {
        const password = await bcrypt.hash(req.body.password, 10);
  
        const user = new userSchema({
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile,
          password: password,
          isAdmin: false,
          isAvailable: true,
        });
  
        await user.save().then(() => console.log("register successful"));
  
        if (user) {
          res.render("login",{login:true});
        } else {
          res.render("otp", { message: "invalid otp" });
        }
      } else {
        console.log("otp not match");
      }

    

    
  } catch (error) {
    console.log(error.message);
  }
};

loadCheckout = async (req,res) => {

  const userId = req.session.user_id;

  const user = await userSchema.findById({_id: userId})

  const completeUser = await user.populate("cart.item.productId");

  const address = await addressModel.find({userId:userId})
  res.render('checkout',{add:address, totalPrice:completeUser.cart.totalPrice})

}



const addAddress =async (req,res) => {
try {
	  const userSession = req.session
    const addressData = Address({
      name:req.body.name,
      userId:userSession.user_id,
      address:req.body.address,
      city:req.body.city,
      state:req.body.state,
      zip:req.body.zip,
      mobile:req.body.mobile,
    })

    await addressData.save().then(()=>console.log('Address saved'))
      res.redirect('/checkout')
    
	
} catch (error) {
	console.log(error.message);
}
}


loadOrderSummary = (req, res) => {

res.render('ordersummary')

};

loadOrderSuccess = (req, res) => {

  res.render('orderSuccess')

}


const loadForgetPassword = (req, res) => {
  res.render('forgetpassword',{login:true})
}

const forgetPassword = async (req, res) => {
  try {

    const mobile = req.body.mobile
    const user = await userSchema.findOne({ mobile: mobile})
   if (user) {
     newOtp = message.sendMessage(mobile,res)
     console.log('Forget tp',newOtp);   
     res.render('forgetOtp',{newOtp,userData:user,login:true,})
   } else {
    res.render('forgetpassword',{message:"No user found"})
   }

    
  } catch (error) {

    console.log(error.message);
    
  }
}

const verifyForgetPassword = (req, res) => {
    
   try {

     const otp = req.body.otp
     const newOtp = req.body.newotp

     const id = req.body.id

     if (otp == newOtp) {

      res.render('changePassword',{id,login:true})
      
     } else {

      res.render('forgetOtp',{id:id,login:true,message:'Invalid OTP'})
      
     }
    
   } catch (error) {
    
   }
}


const changePassword = async (req, res) =>{

  const id = req.body.id;
  console.log(id);

  const currentPassword = req.body.currentPassword;

  console.log(currentPassword);

  const userData = await userSchema.findById({_id:id})

  console.log(userData);

  const passwordMatch =await bcrypt.compare(req.body.currentPassword,userData.password)

  console.log(passwordMatch);

  if(passwordMatch){
 
    const newPass = await bcrypt.hash(req.body.password,1) 
    const user = await userSchema.findByIdAndUpdate({_id:id}, {$set:{

      password:newPass


    }}).then(()=>{
      res.render('login',{login:true,message:'Password Changed successfully'})
    })

  }else{
    console.log('not updated');
  }
 
}

const loadEditAddress = async (req, res) => {

  const addressId = req.query.id

  console.log(addressId);

  const address =await  Address.findById({_id: addressId}).exec((err,address)=>{
    console.log(address);

    res.render('editaddress', {address,addressId})
  })

 


}


const editAddress = async (req, res) => {

  const addressId = req.body.id

  console.log(addressId);

   await Address.findByIdAndUpdate({_id: addressId},{$set:{
    name: req.body.name,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    mobile: req.body.mobile,
  }}).then(()=>console.log('address updated'))

  res.redirect('/checkout')

}

const deleteAddress = async  (req,res) => {
   

  const  id = req.query.id

  await Address.findByIdAndDelete({_id: id}).then(()=>console.log('address deleted'))

  res.redirect('/checkout')


}


const placeOrder = async (req, res) => {
  try {
    userSession = req.session;

    const addressId = req.body.addressId;

    console.log('addressId ',addressId);


    const userData = await userModel.findById({_id:userSession.user_id})

    const completeUser = await userData.populate("cart.item.productId");

    if(completeUser){


      const address = await Address.findById({_id:addressId})

      console.log('address',address);

     if(req.body.payment == 'cod'){
      if(address){

        const order = await orderModel({

          userId : userSession.user_id,

          payment:req.body.payment,

          name:address.name,

          address: address.address,
          city :address.city,
          state :address.state,
          zip :address.zip,
          mobile :address.mobile,
          products:completeUser.cart,
        })

        order.save().then(()=>console.log('order saved'))

        console.log('order saved');


        res.render('orderSuccess')


      }else{

        console.log('order not saved');

      }
     }else{
      console.log('payment is ',req.body,payment);
     }


    }else{



    }
  
  } catch (error) {
    
  }
  
  } 

  const loadOrderDetails = async (req, res) => {

    const userId = req.session.user_id

    const user = await userModel.findById({_id: userId})

    const orderDetails = await orderModel.find({userId: userId})

    const order = await orderDetails.populate("products.item.productId" )

    // const completeUser = await userData.populate("cart.item.productId");

    console.log('orderDetails',order);




    res.render('orderDetails')
  }


  const cancelOrder = (req, res) => {


  }
  








module.exports = {
  cancelOrder,
  loadOrderDetails,
  deleteAddress,
  loadEditAddress,
  changePassword,
  verifyForgetPassword,
  forgetPassword,
  loadForgetPassword,
  addToWishlist,
  addCartDeleteWishlist,
  deleteWishlist,
  loadOrderSuccess,
  loadOrderSummary,
  placeOrder,
  addAddress,
  editAddress,
  loadCheckout,
  loadProductDetails,
  loadHome,
  loadContact,
  loadProduct,
  loadCart,
  loadShop,
  loadLogin,
  // loadRegister,
  registerUser,
  verifyLogin,
  loadOtp,
  verifyOtp,
  addToCart,
  deleteCart,
  loadWishlist,
  addAddress
};
