const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');
const multer = require('multer');

//Load Idea Model
require('../models/Idea');
const Idea = mongoose.model('ideas');

//after login Home page
router.get('/home', ensureAuthenticated, (req, res) => {
    
            res.render('ideas/home');
    
    console.log(res.body)
});

//product description page
router.get('/product/:id', ensureAuthenticated, (req, res) => {

    Idea.findOne({
        _id: req.params.id
    }).lean()

        .then(idea => {
            res.render('ideas/product', {
               idea: idea,
            });          
        });
});


//category filter page

router.get('/category/:category', ensureAuthenticated, (req, res) => {
    console.log(req.params.category)
    Idea.find({
        category: req.params.category
    }).lean()

        .then(ideas => {
            console.log(ideas)
            res.render('ideas/category', {
               ideas: ideas,
            });          
        });
});


//Add idea form
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('ideas/add');
});


//Edit idea form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {

    Idea.findOne({
        _id: req.params.id
    }).lean()
        .then(idea => {
            res.render('ideas/edit', {
                idea: idea
            });
        });

});


//Search page
router.get('/search', ensureAuthenticated, (req, res) => {

    try {
        Idea.find({ $or: [{ name: { '$regex': req.query.search, $options: '-i' } }] }, (err, ideas) => {
            if (err) {
                console.log(err);
            } else {
                res.render('ideas/search', {
                    ideas: ideas
                });
            }
        }).lean()
            .sort({ date: 'desc' })
    } catch (error) {
        console.log(error);
    }
});


//Uploads page
router.get('/uploads', ensureAuthenticated, (req, res) => {
    Idea.find({}).lean()
        .sort({ date: 'desc' })
        .then(ideas => {
            res.render('ideas/index', {
                ideas: ideas
            });
        });
    console.log(res.body)
});


//cart page
router.get('/cart', ensureAuthenticated, (req, res) => {
    Idea.find({
        cart: true
    }).lean()

        .then(ideas => {
            console.log(ideas)
            res.render('ideas/cart', {
               ideas: ideas,
            });          
        });
    // console.log(res.body)
});

//remove from cart

router.get('/remcart/:id', ensureAuthenticated, (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
        .then(idea => {
            //new values
            idea.cart = false;


            idea.save()
                .then(idea => {
                    res.redirect('/ideas/cart');
                })
        });
});





//add to cart
router.get('/addcart/:id', ensureAuthenticated, (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
        .then(idea => {
            //new values
            idea.cart = true;


            idea.save()
                .then(idea => {
                    res.redirect('/ideas/cart');
                })
        });
});


// Product upload page
router.post('/uploads', ensureAuthenticated, (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            let errors = [];


            if(!req.body.category){
                errors.push({text: 'Please add a category'});
            }
            if (!req.body.name) {
                errors.push({ text: 'Please add a price' });
            }
            if (!req.body.price) {
                errors.push({ text: 'Please add a price' });
            }
            if (!req.body.exp_date) {
                errors.push({ text: 'Please add an expiry date' });
            }
            if (!req.body.pkd_date) {
                errors.push({ text: 'Please add a packed date' });
            }
            if (!req.body.quantity) {
                errors.push({ text: 'Please add a quantity' });
            }
            if (!req.body.discount) {
                errors.push({ text: 'Please add a discount' });
            }
            if (errors.length > 0) {
                res.render('ideas/add', {
                    errors: errors,
                    category: req.body.category,
                    name: req.body.name,
                    price: req.body.price,
                    exp_date: req.body.exp_date,
                    pkd_date: req.body.pkd_date,
                    quantity: req.body.quantity,
                    discount: req.body.discount

                });
            }
        }
        console.log(req.body);
        console.log(req.file);
        const cart= false;
        const newUser = {
            category: req.body.category,
            name: req.body.name,
            price: req.body.price,
            exp_date: req.body.exp_date,
            pkd_date: req.body.pkd_date,
            quantity: req.body.quantity,
            discount: req.body.discount,
            image: req.file.filename,
            newprice:((100-req.body.discount)*req.body.price)/100,
            cart: cart
            
        }
        
        new Idea(newUser)
            .save()
            .then(idea => {
                res.redirect('/ideas/uploads');
            })

    });
});






// Multer disk storage
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

var upload = multer({ storage: storage }).single('image');
// router.get('/uploads', function (req, res) {
//     res.render('ideas/index');
// });



// Edit form process
router.put('/uploads/:id', ensureAuthenticated, (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
        .then(idea => {
            //new values
            idea.category = req.body.category;
            idea.name = req.body.name;
            idea.price = req.body.price;
            idea.exp_date = req.body.exp_date;
            idea.pkd_date = req.body.pkd_date;
            idea.quantity = req.body.quantity;
            idea.discount = req.body.discount;

            idea.save()
                .then(idea => {
                    res.redirect('/ideas/uploads');
                })
        });
});


//Delete Product
router.delete('/uploads/:id', ensureAuthenticated, (req, res) => {
    Idea.remove({ _id: req.params.id })
        .then(() => {
            res.redirect('/ideas/uploads');
        });
});

module.exports = router;