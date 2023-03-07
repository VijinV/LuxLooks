const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default:1
    // required: true
  },
  description: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    // required: true
  },
  image: {
    type: Array
  },
  sales: {
    type: Number,
    default:1,
  },
  isAvailable: {
    type: Number,
    default: 1
  }
})

productSchema.methods.decreaseQuantity = async function (quantity) {
  try {
    const updatedProduct = await this.model('Product').findByIdAndUpdate(
      this._id,
      { $inc: { quantity: -quantity } },
      { new: true }
    )
    return updatedProduct
  } catch (error) {
    throw new Error(error.message)
  }
}

module.exports = mongoose.model('Product', productSchema)
