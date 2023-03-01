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
const couponModel = require("../model/couponModel");

let login = false;

let newUser;

loadHome = (req, res) => {
  try {
    const session = req.session.user_id;
    const userImage = req.session.userImg;

    console.log(userImage);

    login = false;
    productModel.find({}).exec((err, product) => {
      if (product) {
        res.render("home", { session, product, login, userImage });
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
      userImage: req.session.userImg,
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
      userImage: req.session.userImg,
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
      res.render("shop", {
        session,
        product,
        login,
        userImage: req.session.userImg,
      });
    } else {
      res.render("shop", { session, login, userImage: req.session.userImg });
    }
  });
};

loadProduct = (req, res) => {
  const session = req.session.user_id;
  login = false;
  res.render("productDetails", {
    session,
    login,
    userImage: req.session.userImg,
  });
};

loadContact = (req, res) => {
  const session = req.session.user_id;
  login = false;
  res.render("contact", { session, login, userImage: req.session.userImg });
};

loadLogin = (req, res) => {
  login = true;
  res.render("login", { login, userImage: req.session.userImg });
};

// loadRegister = (req, res) => {
//   login = true;
//   res.render("register", { login });
// };

loadProductDetails = async (req, res) => {
  login = false;
  try {
    const session = req.session.user_id;

    const coupon = await couponModel.find({});

    // console.log(req.query.id);

    const product = await productModel.findById({ _id: req.query.id });

    res.render("productDetails", {
      product,
      session,
      login,
      userImage: req.session.userImg,
      coupon,
    });
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
          req.session.userImg = userData.image;
          // console.log(userData.image);
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
    userImage: req.session.userImg,
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
  res.render("ordersummary", {
    session: req.session.user_id,
    userImage: req.session.userImg,
  });
};


//   await userModel.findOneAndUpdate(
//     { _id: req.session.user_id },
//     {
//       $set: {
//         "cart.item ": [],
//         "cart.totalPrice": "0",
//       },
//     }
//   );

//   res.render("orderSuccess", {
//     session: req.session.user_id,
//     userImage: req.session.userImg,
//   });
// };

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
        userImage: req.session.userImg,
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

  res.redirect("/address");
};

const deleteAddress = async (req, res) => {
  const id = req.query.id;

  await Address.findByIdAndDelete({ _id: id }).then(() =>
    console.log("address deleted")
  );

  res.redirect("/address");
};


const placeOrder = async (req, res) => {
  try {
    console.log('hai');
    userSession = req.session;
    console.log(userSession);

    if (userSession) {
      const addressId = req.body.addressId;
      console.log('1',addressId);


      if (addressId) {
        console.log('2');
        const userData = await userModel.findById({ _id: userSession.user_id });
        const completeUser = await userData.populate("cart.item.productId");
        console.log('3');
        if (completeUser) {
          const address = await addressModel.findById({ _id: addressId });

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
          }
          //! address not found
          else {
            console.log("address not found");
          }

          if (req.body.payment == "cod") {

            console.log('success');

            res.redirect('/orderSuccess')

          } else {
            res.render("razorpay", {
              total: completeUser.cart.totalPrice,
              session: req.session.user_id,
            });

          }
        } else {
        }
      } else {
        res.send("please wait ...");
      }
    }
  } catch (error) {}
};



const loadOrderDetails = async (req, res) => {
  const userId = req.session.user_id;
  console.log(userId);
  await userModel.findById({ _id: userId });

  const orderDetails = await orderModel
    .find({ userId: userId })
    .exec((err, data) => {
      res.render("ordersummary", {
        session: req.session.user_id,
        order: data,
        userImage: req.session.userImg,
      });
    });
};

const cancelOrder = async (req, res) => {
  await orderModel.findOneAndUpdate(
    { _id: req.query.id },
    {
      $set: {
        status: "Cancel",
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
    res.render("userProfile", {
      user,
      session: req.session.user_id,
      userImage: req.session.userImg,
    });
    console.log(user.image);
  });
};

const loadEditUserProfile = async (req, res) => {
  const session = req.session;

  userSchema.findById({ _id: session.user_id }).exec((err, user) => {
    res.render("editUserProfile", {
      user,
      session: req.session.user_id,
      userImage: req.session.userImg,
    });
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
    .then((user) => {
      req.session.userImg = user.image;
      console.log(user.image);
      res.redirect("/editProfile");
    })
    .then(() => console.log("edited"));
};

const payment = async (req, res) => {
  userSession = req.session;
  const userData = await userModel.findById({_id:userSession.user_id});
  const completeUser = await userData.populate('cart.item.productId');
  var instance = new RazorPay({
      key_id:process.env.KEY_ID,
      key_secret:process.env.KEY_SECRET,
  })
  
  console.log(completeUser.cart.totalPrice);
  let order = await instance.orders.create({
      amount:completeUser.cart.totalPrice * 100,
      currency:"INR",
      receipt:"receipt#1"
  })
  res.status(201).json({
      success:true,
      order,
  });
  }

///!

const razorpayCheckout = async (req, res) => {
  try {
    const paymentId = req.body.payment_id;
    const orderId = req.body.razorpay_order_id;
    const signature = req.body.razorpay_signature;
    const userId = req.session.user_id;

    var instance = new RazorPay({
      key_id: process.env.key_id,
      key_secret: process.env.key_secret,
    });
    // Fetch the order details from the database
    const order = await Orders.findById(req.session.currentOrder).populate(
      "products.item.productId"
    );

    // Check if the order exists and belongs to the current user
    if (!order || order.userId.toString() !== userId) {
      return res.status(400).send("Invalid order");
    }

    // Check if the payment was successful
    const payment = await instance.payments.fetch(paymentId);
    console.log(payment);
    if (payment.status !== "captured") {
      order.status = "Payment failed";
      await order.save();
      return res.redirect("/checkout");
    }

    // Update the order status and redirect to the success page
    order.status = "Placed";
    await order.save();

    res.redirect("/success");
  } catch (error) {
    console.log(error.message);
  }
};

const placeOrder01 = async (req, res) => {
  userSession = req.session;
  const userId = userSession.user_id;
  const payment = req.body.payment;
  const address_id = req.body.address_id;
  let totalPrice;

  const userData = await User.findById({ _id: userId });
  const completeUser = await userData.populate("cart.item.productId");
  const couponData = await Coupon.find({ usedBy: userId });

  if (couponData) {
    delete userSession.offer;
    delete userSession.couponTotal;
  }

  totalPrice = userSession.couponTotal || completeUser.cart.totalprice;
  let updatedTotal = totalPrice + 45;

  userData.cart.totalprice = updatedTotal;
  const updatedUserData = await userData.save();
  console.log(completeUser.cart);

  const offerName = userSession.offer ? userSession.offer.name : "None";
  if (updatedTotal > 0) {
    const order = new Orders({
      userId: userId,
      payment: payment,
      addressId: address_id,
      products: {
        item: completeUser.cart.item,
        totalPrice: updatedTotal,
      },
      offer: offerName,
    });

    let orderProductStatus = [];
    for (let key of order.products.item) {
      orderProductStatus.push(0);
    }

    order.productReturned = orderProductStatus;

    const orderData = await order.save();
    console.log(address_id);

    userSession.currentOrder = orderData._id;
    if (userSession.offer) {
      const offerUpdate = await Coupon.updateOne(
        { name: userSession.offer.name },
        { $push: { usedBy: userId } }
      );
    }

    if (req.body.payment == "Cash-On-Delivery") {
      // If payment method is COD, set status to Placed and redirect to success page
      orderData.status = "Placed";
      await orderData.save();
      res.redirect("/success");
    } else if (req.body.payment == "RazorPay") {
      try {
        // If payment method is Razorpay, create a new order on Razorpay and render the checkout page
        var instance = new RazorPay({
          key_id: process.env.key_id,
          key_secret: process.env.key_secret,
        });
        let razorpayOrder = await instance.orders.create({
          amount: updatedTotal * 100, // Amount in paise
          currency: "INR",
          receipt: orderData._id.toString(),
        });
        res.render("razorpay", {
          userId: userSession.user_id,
          total: updatedTotal,
          order_id: razorpayOrder.id,
          key_id: process.env.key_id,
          user: userData,
        });
      } catch (err) {
        // If there is an error with the payment, update the order status to "Payment failed"
        orderData.status = "Payment failed";
        await orderData.save();
        res.redirect("/payment-failed");
      }
    } else {
      res.redirect("/collection");
    }
  } else {
    res.redirect("/checkout");
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const userId = req.session.user_id;

    const user = await userModel
      .findById(userId)
      .populate("cart.item.productId");

    const cartItem = user.cart.item.find(
      (item) => item.productId._id.toString() === productId.toString()
    );

    const productPrice = cartItem.productId.price;

    const qtyChange = qty - cartItem.qty;

    cartItem.qty = qty;
    cartItem.price = productPrice * qty;

    // recalculate the total price of the cart
    const totalPrice = user.cart.item.reduce(
      (acc, item) => acc + item.price,
      0
    );
    user.cart.totalPrice = totalPrice;

    // mark the cart and totalPrice fields as modified
    user.markModified("cart");
    user.markModified("cart.totalPrice");

    // save the updated user document
    await user.save().then((data) => {
      console.log(data);
    });

    // send the updated subtotal and grand total back to the client
    const subtotal = user.cart.item.reduce((acc, item) => acc + item.price, 0);
    const grandTotal = subtotal + 45;

    res.json({ subtotal, grandTotal, productPrice, qtyChange });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating cart item");
  }
};

///!

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

const loadAddress = async (req, res) => {
  const userId = req.session.user_id;

  const user = await userSchema.findById({ _id: userId });

  const address = await addressModel.find({ userId: userId });
  res.render("loadAddress", {
    add: address,
    session: req.session.user_id,
    userImage: req.session.userImg,
  });
};

let noCoupon;

const applyCoupon = async (req, res) => {
  try {
    if (userSession.user_id) {
      const userData = await userModel.findById({ _id: userSession.user_id });
      const coupon = await couponModel.findOne({ code: req.body.coupon });
      if (coupon) {
        if (coupon.usedBy.includes(userSession.user_id)) {
          noCoupon = true;
          res.redirect("/cart");
        } else {
          userSession.couponName = coupon.code;
          // userSession.coupon.type = coupon.type;
          userSession.couponDiscount = coupon.discount;

          let updatedTotal =
            userData.cart.totalPrice -
            (userData.cart.totalPrice * userSession.couponDiscount) / 100;
          userSession.couponTotal = updatedTotal;

          console.log(userSession.couponTotal);
          res.redirect("/checkout");
        }
      } else {
        res.redirect("/checkout");
      }
    } else {
      res.redirect("/loadCart");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadOrderSuccess = async (req, res) => {
  try {
    if (userSession) {
      await order
        .save()
        .then(() => {
          userModel
            .findByIdAndUpdate(
              { _id: req.session.user_id },
              {
                $set: {
                  "cart.item": [],
                  "cart.totalPrice": "0",
                },
              },
              { multi: true }
            )
            .then(() => {
             
            });
        }).then(()=>{
          console.log('Successfully order placed');
        })

        res.render("orderSuccess", { session: req.session.user_id });

        console.log('success');
      }



  } catch (error) {}
};

module.exports = {
  applyCoupon,
  updateCartItem,
  loadAddress,
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
  loadOrderSuccess
};
