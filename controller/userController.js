const bcrypt = require("bcrypt");
let newOtp;

const userSchema = require("../model/userModel");
const message = require("../config/sms");
const productModel = require("../model/productModel");
const Address = require("../model/addressModel");
const Order = require("../model/orderModel");

let newUser;

// page rendering functions

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
      total:completeUser.totalPrice
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
    const userData = await userSchema.findById({ _id: userSession.user_id });
    const completeUser = await userData.populate("wishlist.item.productId");
    console.log(completeUser);
    res.render("wishlist", {
      isLoggedin,
      id: userSession.userId,
      wishlistProducts: completeUser.wishlist,
    });

    next()
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

loadRegister = (req, res) => {
  const login = true;
  res.render("register", { login });
};

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

  const mobile = userData.mobile;

  newOtp = message.sendMessage(mobile, res);

  console.log(newOtp);

  res.render("otp", { newOtp, userData });
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
    const otp = req.body.newotp;

    console.log(req.body.otp);

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
        res.render("login");
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

  Address.find({}).exec((err, address) => {

    res.render('checkout',{add:address})

  })

}


addAddress =async (req,res) => {
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
      res.render('checkout')
    
	
} catch (error) {
	console.log(error.message);
}
}

placeOrder = async (req, res) => {
try {
  userSession = req.session;


    // if (userSession.user_id) {
    //   const userData = await userSchema.findById({ _id: userSession.user_id });
    //   const completeUser = await userData.populate("cart.item.productId");
    //   // console.log('CompleteUser: ', completeUser

    //   console.log(completeUser);

    //   const address = await Address.findById({ _id: req.body.address});

    //   if (completeUser.cart.totalPrice > 0) {
    //     const order = Order({
    //       userId: userSession.userId,
    //       payment: req.body.payment,
    //       name:address.name,
    //       country: address.country,
    //       address: address.address,
    //       city: address.city,
    //       state: address.state,
    //       zip: address.zip,
    //       mobile: address.mobile,
    //       products: completeUser.cart,
    //     });
    //     const orderProductStatus = [];
    //     for (const key of order.products.item) {
    //       orderProductStatus.push(0);
    //     }
    //     order.productReturned = orderProductStatus;

    //     const orderData = await order.save();
    //     // console.log(orderData)
    //     userSession.currentOrder = orderData._id;

    //     req.session.currentOrder = order._id;

    //     const ordern = await Order.findById({ _id: userSession.currentOrder });
    //     const productDetails = await Product.find({ is_available: 1 });
    //     for (let i = 0; i < productDetails.length; i++) {
    //       for (let j = 0; j < ordern.products.item.length; j++) {
    //         if (
    //           productDetails[i]._id.equals(ordern.products.item[j].productId)
    //         ) {
    //           productDetails[i].sales += ordern.products.item[j].qty;
    //         }
    //       }
    //       productDetails[i].save();
    //     }

        

        if (req.body.payment == "cod") {
          res.redirect("/orderSuccess");
        
        } else {
          res.redirect("/checkout");
        }
      // } else {
      //   res.redirect("/shop");
      // }
    // } else {
    //   res.redirect("/login");
    // }
  
} catch (error) {
  
}

}












loadOrderSummary = (req, res) => {

res.render('ordersummary')

};

loadOrderSuccess = (req, res) => {

  res.render('orderSuccess')

}







module.exports = {
  addToWishlist,
  addCartDeleteWishlist,
  deleteWishlist,
  loadOrderSuccess,
  loadOrderSummary,
  placeOrder,
  addAddress,
  loadCheckout,
  loadProductDetails,
  loadHome,
  loadContact,
  loadProduct,
  loadCart,
  loadShop,
  loadLogin,
  loadRegister,
  registerUser,
  verifyLogin,
  loadOtp,
  verifyOtp,
  addToCart,
  deleteCart
};
