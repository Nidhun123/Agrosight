const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const app = express();
const path = require('path');


const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
// const fs = require('fs');
// require('dotenv/config');
// const Regex = require("regex");
// const bodyParser = require('body-parser');


//Load routes
const users = require('./routes/users');
const ideas = require('./routes/ideas');

// Passport Config
require('./config/passport')(passport);

//Map global promises - get ris of warning
mongoose.Promise = global.Promise;


//Connect to mongoose
mongoose.connect("mongodb://localhost:27017/agrosight", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

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






// Express Session Middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }))

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect-flash Middleware
app.use(flash());

// Global variables
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null; 
    next();
});

//use routes
app.use('/users', users);
app.use('/ideas', ideas);






app.get('/', (req, res) => {
    //console.log(req.name)
    const title = 'Welcome';
    res.render('index', {
        title: title
    });
});







const port = 5000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})
