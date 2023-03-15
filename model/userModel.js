const mongoose = require("mongoose");
const productModel = require("./productModel");
const Product = require("./productModel");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  dob:{
    type:String
  },
  password2: {
    type: String,
  },
  isAdmin: {
    type: Number,
    // required: true
  },
  isAvailable: {
    type: Number,
  },
  image:{
    type: String,

  }, wallet:{
    type:Number,
    default:0,
  },
  cart: {
    item: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        qty: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
        },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  wishlist: {
    item: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        price: {
          type: Number,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = async function (product) {
 
    let cart = this.cart;

    const isExisting = cart.item.findIndex((item) => {
      return (
        new String(item.productId).trim() == new String(product._id).trim()
      );
    });

    if (isExisting >= 0) {
      cart.item[isExisting].qty += 1;
    } else {
      cart.item.push({
        productId: product._id,
        qty: 1,
      });
    }

    if (!cart.totalPrice) {
      cart.totalPrice = 0;
    }
    cart.totalPrice += product.price;
    return this.save();
  }
  
userSchema.methods.removefromCart = async function (productId) {
  const cart = this.cart
  const isExisting = cart.item.findIndex(
    (objInItems) =>
      new String(objInItems.productId).trim() === new String(productId).trim()
  )
  if (isExisting >= 0) {
    const prod = await Product.findById(productId)
    cart.totalPrice -= prod.price * cart.item[isExisting].qty
    cart.item.splice(isExisting, 1)
    console.log('User in schema:', this)
    return this.save()
  }
}


userSchema.methods.addToWishlist = function (product) {
  const wishlist = this.wishlist;
  const isExisting = wishlist.item.findIndex((item) => {
    console.log(item.productId,'==',product._id)

    return new String(item.productId).trim() == new String(product._id).trim();
    
  });
  console.log(isExisting);
  if (isExisting >= 0) {
  } else {
    wishlist.item.push({
      productId: product._id,
    });
    console.log('added to wishlist')
  }
  return this.save();
};

userSchema.methods.removefromWishlist = async function (productId) {
  const wishlist = this.wishlist;
  const isExisting = wishlist.item.findIndex(
    (objInItems) =>
      new String(objInItems.productId).trim() === new String(productId).trim()
  );
  if (isExisting >= 0) {
    wishlist.item.splice(isExisting, 1);
    return this.save();
  }
};

userSchema.methods.placeOrder = function () {
  let cart = this.cart;
  // const isExisting = cart.item.findIndex((item) => {
  //   return new String(item.productId).trim() == new String(product).trim();
  // });

  // if (isExisting >= 0) {
  //   cart.item.splice(isExisting, 1);

  //   return this.save();
  // }

  cart.item.splice()
  return this.save();
};


module.exports = mongoose.model("User", userSchema);
