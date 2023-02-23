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

const RazorPay = require("razorpay");

let login = false;

let newUser;

loadHome = (req, res) => {
  try {
    const session = req.session.user_id;
    login = false;
    productModel.find({}).exec((err, product) => {
      if (product) {
        res.render("home", { session, product, login });
      } else {
        res.render("home", { session, login });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};
// !================================================================
const loadCart = async (req, res) => {
  try {
    login = false;
    userSession = req.session;
    const userData = await userSchema.findById({ _id: userSession.user_id });
    const completeUser = await userData.populate("cart.item.productId");

    res.render("cart", {
      login,
      id: userSession.user_id,
      cartProducts: completeUser.cart.item,
      total: completeUser.cart.totalPrice,
      session: req.session.user_id,
    });
  } catch (error) {
    console.log(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const productId = req.body.id;
    console.log(productId);
    userSession = req.session;
    const userData = await userSchema.findById({ _id: userSession.user_id });
    const productData = await productModel.findById({ _id: productId });
    await userData.addToCart(productData);
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
    const productId = req.body.id;
    console.log(productId);
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
    userSession = req.session;
    const userData = await userSchema.findById({ _id: userSession.user_id });
    const completeUser = await userData.populate("wishlist.item.productId");

    res.render("wishlist", {
      id: userSession.user_id,
      products: completeUser.wishlist.item,
      session: req.session.user_id,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const addCartDeleteWishlist = async (req, res) => {
  try {
    userSession = req.session;
    const productId = req.query.id;
    const userData = await userModel.findById({ _id: userSession.user_id });
    const productData = await productModel.findById({ _id: productId });
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
    const userData = await userModel.findById({ _id: userSession.user_id });
    await userData.removefromWishlist(productId);
    res.redirect("/wishlist");
  } catch (error) {
    console.log(error.message);
  }
};

// !================================================================

const loadShop = (req, res) => {
  const session = req.session.user_id;
  login = false;
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
  login = false;
  res.render("productDetails", { session, login });
};

loadContact = (req, res) => {
  const session = req.session.user_id;
  login = false;
  res.render("contact", { session, login });
};

loadLogin = (req, res) => {
  login = true;
  res.render("login", { login });
};

// loadRegister = (req, res) => {
//   login = true;
//   res.render("register", { login });
// };

loadProductDetails = async (req, res) => {
  login = false;
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
      res.render("register", {
        message: "This Account is already registered",
        login: true,
      });
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
  login = true;
  const mobile = userData.mobile;

  newOtp = message.sendMessage(mobile, res);

  console.log(newOtp);
  setTimeout(() => {
    newOtp = null;
  }, 1);

  res.render("otp", { newOtp, userData, login });
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
            login: true,
            message: "You are Blocked by the administrator",
          });
        }
      } else {
        res.render("login", { login: true, message: "Invalid password" });
      }
    } else {
      res.render("login", { login: true, message: "Account not found" });
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
        res.render("login", { login: true });
      } else {
        res.render("otp", { message: "invalid otp", login: true });
      }
    } else {
      console.log("otp not match");
    }
  } catch (error) {
    console.log(error.message);
  }
};

loadCheckout = async (req, res) => {
  const userId = req.session.user_id;

  const user = await userSchema.findById({ _id: userId });

  const completeUser = await user.populate("cart.item.productId");

  const address = await addressModel.find({ userId: userId });
  res.render("checkout", {
    add: address,
    totalPrice: completeUser.cart.totalPrice,
    session: req.session.user_id,
  });
};

const addAddress = async (req, res) => {
  try {
    const userSession = req.session;
    const addressData = Address({
      name: req.body.name,
      userId: userSession.user_id,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      mobile: req.body.mobile,
    });

    await addressData.save().then(() => console.log("Address saved"));
    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
  }
};

loadOrderSummary = (req, res) => {
  res.render("ordersummary", { session: req.session.user_id });
};

loadOrderSuccess = (req, res) => {
  res.render("orderSuccess", { session: req.session.user_id });
};

const loadForgetPassword = (req, res) => {
  res.render("forgetpassword", { login: true, session: req.session.user_id });
};

const forgetPassword = async (req, res) => {
  try {
    const mobile = req.body.mobile;
    const user = await userSchema.findOne({ mobile: mobile });
    if (user) {
      newOtp = message.sendMessage(mobile, res);
      console.log("Forget tp", newOtp);
      res.render("forgetOtp", { newOtp, userData: user, login: true });
    } else {
      res.render("forgetpassword", { message: "No user found", login: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyForgetPassword = (req, res) => {
  try {
    const otp = req.body.otp;
    const newOtp = req.body.newotp;

    const id = req.body.id;

    if (otp == newOtp) {
      res.render("changePassword", { id, login: true });
    } else {
      res.render("forgetOtp", { id: id, login: true, message: "Invalid OTP" });
    }
  } catch (error) {}
};

const changePassword = async (req, res) => {
  const id = req.body.id;
  console.log(id);

  const currentPassword = req.body.currentPassword;

  console.log(currentPassword);

  const userData = await userSchema.findById({ _id: id });

  console.log(userData);

  const passwordMatch = await bcrypt.compare(
    req.body.currentPassword,
    userData.password
  );

  console.log(passwordMatch);

  if (passwordMatch) {
    const newPass = await bcrypt.hash(req.body.password, 1);
    const user = await userSchema
      .findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            password: newPass,
          },
        }
      )
      .then(() => {
        res.render("login", {
          login: true,
          message: "Password Changed successfully",
        });
      });
  } else {
    console.log("not updated");
  }
};

const loadEditAddress = async (req, res) => {
  const addressId = req.query.id;

  console.log(addressId);

  const address = await Address.findById({ _id: addressId }).exec(
    (err, address) => {
      console.log(address);

      res.render("editaddress", {
        address,
        addressId,
        session: req.session.user_id,
      });
    }
  );
};

const editAddress = async (req, res) => {
  const addressId = req.body.id;

  console.log(addressId);

  await Address.findByIdAndUpdate(
    { _id: addressId },
    {
      $set: {
        name: req.body.name,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        mobile: req.body.mobile,
      },
    }
  ).then(() => console.log("address updated"));

  res.redirect("/checkout");
};

const deleteAddress = async (req, res) => {
  const id = req.query.id;

  await Address.findByIdAndDelete({ _id: id }).then(() =>
    console.log("address deleted")
  );

  res.redirect("/checkout");
};

const placeOrder = async (req, res) => {
  try {
    userSession = req.session;

    const addressId = req.body.addressId;

    console.log("addressId ", addressId);

    const userData = await userModel.findById({ _id: userSession.user_id });

    const completeUser = await userData.populate("cart.item.productId");

    if (completeUser) {
      const address = await Address.findById({ _id: addressId });

      let order;

      console.log("address", address);
      if (address) {
        order = await orderModel({
          userId: userSession.user_id,

          payment: req.body.payment,

          name: address.name,

          address: address.address,
          city: address.city,
          state: address.state,
          zip: address.zip,
          mobile: address.mobile,
          products: completeUser.cart,
        });

        console.log(completeUser.cart.item);
      } else {
        console.log("order not saved");
      }

      if (req.body.payment == "cod") {
        res.render("orderSuccess", { session: req.session.user_id });
        order
          .save()
          .then(() => {
            userData.placeOrder();
          })
          .then(() => {
            console.log("order saved");
          });
      } else {
        res.render("razorpay", {
          total: completeUser.cart.totalPrice,
          session: req.session.user_id,
        });
        order.save().then(() => console.log("order saved"));
      }
    } else {
    }
  } catch (error) {}
};

// TODO:  Change the printing of the orders ................

const loadOrderDetails = async (req, res) => {
  const userId = req.session.user_id;
  console.log(userId);
  await userModel.findById({ _id: userId });

  const orderDetails = await orderModel
    .find({ userId: userId })
    .exec((err, data) => {
      res.render("ordersummary", { session: req.session.user_id, order: data });
    });
};

// const loadOrderDetails = async (req, res) => {
//   // const userId = req.session.user_id;
//   const userId = "63e33b2fa89d21fe4d73cbec";
//   console.log(userId);
//   const user = await userModel.findById({ _id: userId });

//   const orderDetails = await orderModel
//     .find({ userId: userId })
//     .exec((err, data) => {
//       res.render("ordersummary", {
//         order: data,
//       });
//     });
// };

// TODO: cancel order has not completed yet ................

const cancelOrder = async (req, res) => {
  await orderModel.findOneAndUpdate(
    { _id: req.query.id },
    {
      $set: {
        status: false,
      },
    }
  );
  console.log("cancelled order");
  res.redirect("/OrderDetails");
};

const viewOrders = async (req, res) => {

  const order = await orderModel.findOne({ _id: req.query.id });

  const completeData = await order.populate("products.item.productId");

  res.render("orderlist", {
    order: completeData.products.item,
    session: req.session.user_id,
  });
};

//!================================================================

const loadUserProfile = async (req, res) => {
  const session = req.session;

  userSchema.findById({ _id: session.user_id }).exec((err, user) => {
    res.render("userProfile", { user, session: req.session.user_id });
    console.log(user.image);
  });
};

const loadEditUserProfile = async (req, res) => {
  const session = req.session;

  userSchema.findById({ _id: session.user_id }).exec((err, user) => {
    res.render("editUserProfile", { user, session: req.session.user_id });
  });
};

const editUserProfile = async (req, res) => {   
  const id = req.session.user_id;
  await userSchema
    .findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name: req.body.name,
          dob: req.body.dob,
          image: req.file.filename,
        },
      }
    )
    .then(() => {
      res.redirect("/editProfile");
    })
    .then(() => console.log("edited"));
};

const payment = async (req, res) => {
  userSession = req.session;
  const userData = await userModel.findById({ _id: userSession.user_id });
  const completeUser = await userData.populate("cart.item.productId");
  var instance = new RazorPay({
    key_id: "rzp_test_m2QMJlI1oi6E6F",
    key_secret: "UqQbA4vzZOYIuHu5Bus3zr7i",
  });

  console.log(completeUser.cart.totalPrice);
  let order = await instance.orders.create({
    amount: completeUser.cart.totalPrice * 100,
    currency: "INR",
    receipt: "receipt#1",
  });
  res.status(201).json({
    success: true,
    order,
  });
};

const editMobile = async (req, res) => {
  console.log(req.session.user_id);
  const user = await userModel.findById({ _id: req.session.user_id });
  newOtp = message.sendMessage(user.mobile, res);
  console.log(newOtp);

  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(
    '<input class = "form-control" id="otp"  type="text" name="new-input"> <button onclick="checkOtp()" type="button" class="text-primary">Submit Otp</button>'
  );
  res.end();
};

const checkOtp = (req, res) => {
  const otp = req.body.otp;
  if (otp == newOtp) {
    return true;
  }
};

module.exports = {
  checkOtp,
  editMobile,
  payment,
  viewOrders,
  loadEditUserProfile,
  editUserProfile,
  loadUserProfile,
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
  registerUser,
  verifyLogin,
  loadOtp,
  verifyOtp,
  addToCart,
  deleteCart,
  loadWishlist,
  addAddress,
};
