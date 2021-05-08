const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const multer = require('multer');
// const fs = require('fs');
// require('dotenv/config');
// const Regex = require("regex");
// const bodyParser = require('body-parser');


//Map global promises - get ris of warning
mongoose.Promise = global.Promise;


//Connect to mongoose
mongoose.connect("mongodb://localhost:27017/agrosight", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));


//Load Idea model
require('./models/Idea');
const Idea = mongoose.model('ideas')

//handlebars middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

//bodyparser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//methrod overrride middleware
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


//Home page
app.get('/', (req, res) => {
    Idea.find({}).lean()
        .sort({ date: 'desc' })
        .then(ideas => {
            res.render('ideas/home', {
                ideas: ideas
            });
        });
    console.log(res.body)
});



//product description page
app.get('/ideas/product/:id', (req, res) => {

    Idea.findOne({
        _id: req.params.id
    }).lean()
        .then(idea => {
            res.render('ideas/product', {
                idea: idea
            });
        });
});


//Add idea form
app.get('/ideas/add', (req, res) => {
    res.render('ideas/add');
});


//Edit idea form
app.get('/ideas/edit/:id', (req, res) => {

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
app.get('/ideas/search', (req, res) => {

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


//Idea index page
app.get('/ideas/uploads', (req, res) => {
    Idea.find({}).lean()
        .sort({ date: 'desc' })
        .then(ideas => {
            res.render('ideas/index', {
                ideas: ideas
            });
        });
    console.log(res.body)
});


// Product upload page
app.post('/ideas/uploads', (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            let errors = [];

            // if(!req.body.category){
            //     errors.push({text: 'Please add a category'});
            // }
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
                    // category: req.body.category,
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
        const newUser = {
            // category: req.body.category,
            name: req.body.name,
            price: req.body.price,
            exp_date: req.body.exp_date,
            pkd_date: req.body.pkd_date,
            quantity: req.body.quantity,
            discount: req.body.discount,
            image: req.file.filename
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
app.get('/ideas/uploads', function (req, res) {
    res.render('ideas/index');
});



// Edit form process
app.put('/ideas/uploads/:id', (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
        .then(idea => {
            //new values
            // idea.category = req.body.category;
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
app.delete('/ideas/uploads/:id', (req, res) => {
    Idea.remove({ _id: req.params.id })
        .then(() => {
            res.redirect('/ideas/uploads');
        });
});



const port = 5000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})