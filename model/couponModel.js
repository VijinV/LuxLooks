const mongoose = require('mongoose');

const User = require('../model/userModel')

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  discount: {
    type: Number,
    // required: true,
    min: 0,
    max:100
  },
  maxLimit:{
    type: Number,
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    // required: true,
    default: true
  },
  createdAt: {
    type: Date,
    require:true
    // immutable: true,
    // default: () => Date.now()
  },
  updatedAt: {
    type: Date,
    // default: () => Date.now()
    require:true
  },
  usedBy:[{
    type:mongoose.Types.ObjectId,
    ref:'User'
}],
})

module.exports = mongoose.model('Coupon', couponSchema)
