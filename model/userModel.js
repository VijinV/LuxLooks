const mongoose = require("mongoose");
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
          ref: "products",
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


userSchema.methods.removefromCart = function (product) {
  let cart = this.cart;
  const isExisting = cart.item.findIndex((item) => {
    return new String(item.productId).trim() == new String(product).trim();
  });

  if (isExisting >= 0) {
    cart.item.splice(isExisting, 1);

    return this.save();
  }
};

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
      // price: product,

    });
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

module.exports = mongoose.model("User", userSchema);
