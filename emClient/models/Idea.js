const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const IdeaSchema = new Schema({
    category:{
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
    exp_date1:{
        type: Date,
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
    image:{
        type: String,
        required: true
    },
    newprice:{
        type: Number,
        required: true
    },
    cart:{
        type: Boolean,
        required: true
    },
    wishlist:{
        type: Boolean,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    date:{
        type: String,
        default: Date.now
    },
    order: {
        type: Boolean,
        required: true
    }
});

mongoose.model('ideas', IdeaSchema);