var createError = require('http-errors');
var express = require('express');
var path = require('path');
//var cookieParser = require('cookie-parser');
var hbs = require('express-handlebars');
var indexRouter = require('./routes/index');
const mongoose = require('mongoose');
const multer = require('multer');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');
var app = express();

//Map global promises - get ris of warning
mongoose.Promise = global.Promise;


//Connect to mongoose
mongoose.connect("mongodb://mongo:27017/agrosight", {
  
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));



// Passport Config
require('./config/passport')(passport);

// view engine setup
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layouts/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');



app.use(express.json());
app.use(express.urlencoded({ extended: true}));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//methrod overrride middleware
app.use(methodOverride('_method'));



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

app.use('/', indexRouter);







module.exports = app;
