let newOtp;
const userSchema = require("../model/userModel");
const produtModel = require("../model/productModel");

const bcrypt = require("bcrypt");

const message = require("../config/sms");

const addressModel = require("../model/addressModel");

let newUser;

// page rendering functions

loadHome = (req, res) => {
  const session = req.session.user_id;
  const login = false;
  res.render("home", { session, login });
};

loadCart = (req, res) => {
  const session = req.session.user_id;
  const login = false;
  res.render("cart", { session, login });
};

const loadShop = (req, res) => {
  const session = req.session.user_id;
  const login = false;
  produtModel.find({}).exec((err, product) => {
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

    console.log(req.query.id);

    const product = await produtModel.findById({ _id: req.query.id });

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
      res.render("login", { message: "Accout not found" });
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

      console.log(user);

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

loadAddress = (req,res) => {

  res.render('address')
}





module.exports = {
  loadAddress,
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
};
