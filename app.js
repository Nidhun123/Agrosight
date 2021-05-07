const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const Regex = require("regex");
const app = express();

// const fs = require('fs');
// const path = require('path');
// require('dotenv/config');
// // Step 5 - set up multer for storing uploaded files
//  const multer = require('multer');

//map global promises - get ris of warning
mongoose.Promise = global.Promise;

//connect to mongoose

mongoose.connect("mongodb://localhost:27017/agrosight", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// mongoose.connect("mongodb://localhost/vidjot-dev")
// .then(() => console.log('MongoDB Connected...'))
// .catch(err => console.log(err));

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

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(express.urlencoded());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//methrod overrride middleware
app.use(methodOverride('_method'));

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

//About route
app.get('/about', (req, res) => {
    res.render('about');
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

//edit idea form
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

//search page
app.get('/ideas/search', (req, res) => {
 
    try {
        Idea.find({ $or: [{ name: { '$regex': req.query.search, $options: '-i' } }] }, (err, ideas) => {
            if (err) {
                console.log(err);
            } else {
                res.render('ideas/search', { 
                    ideas: ideas
                 });
                
                // console.log(idea[0].name);
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


// upload page
app.post('/ideas/uploads', (req, res) => {

    let errors = [];
    console.log(req.body);
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

            // img: {
            //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            //     contentType: 'image/png'
            // }

        });
    } else {

        const newUser = {
            // category: req.body.category,
            name: req.body.name,
            price: req.body.price,
            exp_date: req.body.exp_date,
            pkd_date: req.body.pkd_date,
            quantity: req.body.quantity,
            discount: req.body.discount
        }
        new Idea(newUser)
            .save()
            .then(idea => {
                res.redirect('/ideas/uploads');
            })
    }
});

// Edit form process
app.put('/ideas/:id', (req, res) => {
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
                    res.redirect('/ideas');
                })
        });
});




//delete idea
app.delete('/ideas/:id', (req, res) => {
    Idea.remove({ _id: req.params.id })
        .then(() => {
            res.redirect('/ideas');
        });
});







// var multer = require('multer');

// var storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads')
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '-' + Date.now())
//     }
// });

// var upload = multer({ storage: storage });


// app.get('/', (req, res) => {
//     imgModel.find({}, (err, items) => {
//         if (err) {
//             console.log(err);
//             res.status(500).send('An error occurred', err);
//         }
//         else {
//             res.render('imagesPage', { items: items });
//         }
//     });
// });


// app.post('/', upload.single('image'), (req, res, next) => {

//     var obj = {
//         name: req.body.name,
//         desc: req.body.desc,
//         img: {
//             data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
//             contentType: 'image/png'
//         }
//     }
//     imgModel.create(obj, (err, item) => {
//         if (err) {
//             console.log(err);
//         }
//         else {
//             // item.save();
//             res.redirect('/');
//         }
//     });
// });




const port = 5000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})