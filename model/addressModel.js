const mongoose = require('mongoose');

const Schema = mongoose.Schema();

const addressSchema = new  Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    fristname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    zip:{
        type:Number,
        required:true
    },
    mobile:{
        type:Number,
        required

    }

})

module.exports = mongoose.model('Address', addressSchema)