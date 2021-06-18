const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const OrderSchema = new Schema({
    product_id:{
        type: String,
        required: true
    },
    name:
    {
        type: String,
        required: true
    },
    price:
    {
        type: Number,
        required: true
    },
    exp_date:{
        type: String,
        default: Date.now
    },
    pkd_date:{
        type: String,
        default: Date.now
    },
    quantity:{
        type: Number,
        required: true
    },
    discount:{
        type: Number,
        required: true
    },
    newprice:{
        type: Number,
        required: true
    },
    address:
    {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    date: {
        type: String,
        default: Date.Now
    }
});

mongoose.model('orders', OrderSchema);