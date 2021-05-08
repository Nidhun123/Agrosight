const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const IdeaSchema = new Schema({
    // category:{
    //     type: Number,
    //     required: true
    // },
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
        type: String,
        required: true
    },
    discount:{
        type: Number,
        required: true
    },
    image:{
        type: String,
        required: true
    }
});

mongoose.model('ideas', IdeaSchema);