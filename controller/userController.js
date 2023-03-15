//Database Models
const productModel = require("../model/productModel");
const addressModel = require("../model/addressModel");
const userModel = require("../model/userModel");
const orderModel = require("../model/orderModel");
const couponModel = require("../model/couponModel");
//==================================================
const RazorPay = require("razorpay");
const message = require("../config/sms");
const bcrypt = require("bcrypt");
const categoryModel = require("../model/categoryModel");

//Global variables =================================
let newOtp;
let login = false;  
let newUser;
let order;


const userProfile = async (req, res) => {

  if(req.session.user_id){
    const user = await userModel.findById({_id:req.session.user_id})
    return user.image
  }else{
    return null;
  }

}
const checkSession = async (req, res) => {

  if(req.session.user_id){
    return req.session.user_id
  }else{
    return null;
  }

}



//==================================================
const loadHome = async (req, res) => {
  try {
    const session = await checkSession(req, res);
    const userImage= await userProfile(req,res)

    productModel.find({}).exec((err, product) => {
        res.render("home", { session:session, product, login:false,userImage });
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadCart = async (req, res) => {
  try {
    const session = await checkSession(req, res);
    const userImage= await userProfile(req,res)
    userSession = req.session;
    const userData = await userModel
      .findById({ _id: userSession.user_id })
      .populate("cart.item.productId");
    const completeUser = await userData.populate("cart.item.productId");

    res.render("cart", {
      login,
      id: userSession.user_id,
      cartProducts: completeUser.cart.item,
      total: completeUser.cart.totalPrice,
      session,
      userImage
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
    const userData = await userModel.findById({ _id: userSession.user_id });
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
    const userData = await userModel.findById({ _id: userSession.user_id });
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
    const userData = await userModel.findById({ _id: userSession.user_id });
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
    const userData = await userModel.findById({ _id: userSession.user_id });
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


const loadShop = async (req, res) => {
  login = false;

  const session = await checkSession(req, res);
  const userImage= await userProfile(req,res)

  const category = await categoryModel.find({})

  const products = await productModel.find({}).exec()

  let Category = req.query.catagory;
  
        const categoryFind = await productModel.find({ category: Category })
        if(Category == ',all'){
            console.log('2554');
            findCatagory = products
        }else{
            findCatagory = categoryFind
        }
        if (!Category) {
            res.render('shop', {
                product: products,
                category:category,
                login:false,
                session,
                userImage

            });
        } else {


            res.json(findCatagory)

        }

  
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
    const userData = await userModel.findOne({ email: req.body.email });
    const userData1 = await userModel.findOne({ mobile: req.body.mobile });

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

    const userData = await userModel.findOne({ email });
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
          res.redirect('/');
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

      const user = new userModel({
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

  const user = await userModel.findById({ _id: userId });

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
    const addressData = addressModel({
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
    const user = await userModel.findOne({ mobile: mobile });
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

  const userData = await userModel.findById({ _id: id });

  console.log(userData);

  const passwordMatch = await bcrypt.compare(
    req.body.currentPassword,
    userData.password
  );

  console.log(passwordMatch);

  if (passwordMatch) {
    const newPass = await bcrypt.hash(req.body.password, 1);
    const user = await userModel
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

  const address = await addressModel
    .findById({ _id: addressId })
    .exec((err, address) => {
      console.log(address);

      res.render("editaddress", {
        address,
        addressId,
        session: req.session.user_id,
        userImage: req.session.userImg,
      });
    });
};

const editAddress = async (req, res) => {
  const addressId = req.body.id;

  console.log(addressId);

  await addressModel
    .findByIdAndUpdate(
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
    )
    .then(() => console.log("address updated"));

  res.redirect("/address");
};

const deleteAddress = async (req, res) => {
  const id = req.query.id;

  await addressModel
    .findByIdAndDelete({ _id: id })
    .then(() => console.log("address deleted"));

  res.redirect("/address");
};

const placeOrder = async (req, res) => {
  try {
    userSession = req.session;
    const addressId = req.body.addressId;
    const address = await addressModel.findById({ _id: addressId });
    const userData = await userModel
      .findById({ _id: userSession.user_id })
      .populate("cart.item.productId");
    const couponData = await couponModel.findOne({
      usedBy: userSession.user_id,
    });
    let totalPrice;

    if (couponData) {
      delete userSession.couponName,
        delete userSession.couponDiscount,
        delete userSession.couponTotal;
    }

    if (userData.cart.totalPrice > 2500) {
      totalPrice = userSession.couponTotal || userData.cart.totalPrice;
    } else {
      totalPrice = (userSession.couponTotal || userData.cart.totalPrice) + 50; //shipping charge rs 50
    }

    const couponName = userSession.couponName
      ? userSession.couponDiscount
      : "None";

    // console.log('totalPrice'+ couponName);

    console.log(userSession);
    console.log("address", address);
    console.log("totalPrice", totalPrice);
    console.log("userData", userData.cart);
    console.log("couponName", couponName);
    console.log("payment", req.body.payment);

    order = new orderModel({
      userId: userSession.user_id,
      payment: req.body.payment,
      name: address.name,
      address: address.address,
      city: address.city,
      state: address.state,
      zip: address.zip,
      mobile: address.mobile,
      products: userData.cart,
      price: totalPrice,
      couponCode: couponName,
    });

    req.session.order_id = order._id;

    console.log("order_id: " + order._id);

    if (req.body.payment == "cod") {
      console.log("success");
      console.log(order);

      res.redirect("/orderSuccess");
    } else {
      var instance = new RazorPay({
        key_id: process.env.KEY_ID,
        key_secret: process.env.KEY_SECRET,
      });
      let razorpayOrder = await instance.orders.create({
        amount: totalPrice * 100,
        currency: "INR",
        receipt: order._id.toString(),
      });
      console.log("order Order created", razorpayOrder);
      res.render("razorpay", {
        userId: req.session.user_id,
        order_id: razorpayOrder.id,
        total: totalPrice,
        session: req.session,
        key_id: process.env.key_id,
        user: userData,
        order: order,
        orderId: order._id.toString(),
      });
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
  const order = await orderModel
    .findOne({ _id: req.query.id })
    .populate("products.item.productId");

  res.render("orderlist", {
    order,
    session: req.session.user_id,
    product: order.products.item,
  });
};

//!================================================================

const loadUserProfile = async (req, res) => {
  const session = req.session;

  userModel.findById({ _id: session.user_id }).exec((err, user) => {
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

  userModel.findById({ _id: session.user_id }).exec((err, user) => {
    res.render("editUserProfile", {
      user,
      session: req.session.user_id,
      userImage: req.session.userImg,
    });
  });
};

const editUserProfile = async (req, res) => {
  const id = req.session.user_id;
  await userModel
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
  const userData = await userModel.findById({ _id: userSession.user_id });
  const completeUser = await userData.populate("cart.item.productId");
  var instance = new RazorPay({
    key_id: "rzp_test_m2QMJlI1oi6E6F",
    key_secret: "UqQbA4vzZOYIuHu5Bus3zr7i",
  });

  console.log(completeUser.cart.totalPrice);
  let myOrder = await instance.orders.create({
    amount: completeUser.cart.totalPrice * 100,
    currency: "INR",
    receipt: "receipt#1",
  });

  console.log(myOrder);

  if (res.status(201)) {
    res.json({ status: "success" });
  } else {
    res.json({ status: "success" });
  }

  // instance.payments.capture(order._id, completeUser.cart.totalPrice * 100, {
  //   currency: "INR"
  // }, (err, payment) => {
  //   if (err) {
  //     res.json({ status: 'failed' });
  //   } else {
  //     console.log(payment);
  //     res.json({ status: 'success' });
  //   }
  // });

  // res.status(201).json({
  //     success:true,
  //     order,
  // });
};

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

  const user = await userModel.findById({ _id: userId });

  const address = await addressModel.find({ userId: userId });
  res.render("loadAddress", {
    add: address,
    session: req.session.user_id,
    userImage: req.session.userImg,
  });
};

let noCoupon;
let updatedTotal;

const applyCoupon = async (req, res) => {
  try {
    const { coupon } = req.body; //coupon code from input field using ajax
    const userSession = req.session;
    let message = "";
    let couponDiscount;
    console.log("coupon name", coupon);

    if (userSession.user_id) {
      const userData = await userModel.findById({ _id: userSession.user_id });

      const couponData = await couponModel.findOne({ code: coupon });

      updatedTotal = userData.cart.totalPrice;

      console.log(updatedTotal);

      if (couponData) {
        if (couponData.usedBy.includes(userSession.user_id)) {
          message = "coupon Already used";
          res.json({ updatedTotal, message });
        } else {
          req.session.couponName = couponData.code;
          req.session.couponDiscount = couponData.discount;
          req.session.maxLimit = couponData.maxLimit;
          console.log(req.session.couponName);
          console.log(req.session.couponDiscount);
          console.log(req.session.maxLimit);

          if (userData.cart.totalPrice < userSession.maxLimit) {
            updatedTotal =
              userData.cart.totalPrice -
              (userData.cart.totalPrice * userSession.couponDiscount) / 100;
            req.session.couponTotal = updatedTotal;
          } else {
            const percentage = parseInt(
              (userSession.couponDiscount / 100) * userSession.maxLimit
            );
            updatedTotal = userData.cart.totalPrice - percentage;
            console.log(updatedTotal);
            couponDiscount = parseInt(percentage);
            console.log("couponDiscount: " + couponDiscount);
            req.session.couponTotal = updatedTotal;
            console.log(userSession.couponDiscount);
          }
          console.log("total", req.session.couponTotal);

          res.json({ updatedTotal, message, couponDiscount });
        }
      } else {
        message = "The promotional code you entered is not valid.";
        res.json({ updatedTotal, message });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadOrderSuccess = async (req, res) => {
  try {
    if (userSession) {
      
      await order.save().then(() => {
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
            console.log("cart deleted");
      
            // Move the product quantity update code inside this block
            orderModel
              .findById(order._id)
              .populate("products.item.productId")
              .then(async (order) => {

                // decreasing quantity when buying products
                for (const product of order.products.item) {
                  await productModel.findByIdAndUpdate(
                    product.productId._id,
                    { $inc: { quantity: -product.qty } },
                    { new: true }
                  );
                }
                // updating status if the product quantity is zero

                for (const product of order.products.item) {
                 const products= await productModel.findById(product.productId._id);
                 
                 if(products.quantity == 0){

                  await productModel.findByIdAndUpdate(product.productId._id,{$set:{
                    isAvailable:0
                  }});

                 }


                }
                
              });
          });
      });
      

      res.render("orderSuccess", { session: req.session.user_id });
    }
  } catch (error) {}
};

const returnOrder = async (req, res) => {
  const orderData = await orderModel.findByIdAndUpdate(
    { _id: req.query.id },
    {
      $set: {
        status: "ReturnRequestReceived",
      },
    }
  );

  console.log(orderData);

  res.redirect("/orderDetails");
};

const loadWallet = async (req, res) => {
  const user = await userModel.findById({ _id: req.session.user_id });
  console.log(user);
  res.render("wallet", { user });
};

const generateInvoice = (req, res) => {};

const orderFailed = async (req, res) => {

 try {
     res.render('paymentFailed')
 } catch (error) {

  console.log(error.message);
  
 }

 


}


const searchProducts = async (req, res) => {
  console.log('searchProducts');
  const query = req.body.search;
  console.log(query);
  const products = await productModel.find({
    name: { $regex: query, $options: "i" },
  });
  console.log(products);
  res.json(products);
};

const  priceSorting = async (req, res) => {
  try {
    
      let products;
      const sortingStyle = req.query.sort;
      console.log("sortingStyle="+sortingStyle);
      if(sortingStyle == ',HighToLow'){
          products = await productModel.find({}).sort({ price: -1 });
      }else if(sortingStyle == ',LowToHigh'){
          products = await productModel.find({}).sort({ price: 1 });
      }else{
          products = await productModel.find({});
      }
     
    res.json(products);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  priceSorting,
  searchProducts,
  orderFailed,
  generateInvoice,
  loadWallet,
  returnOrder,
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
  loadOrderSuccess,
};
