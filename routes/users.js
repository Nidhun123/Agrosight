const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');

//Load User Model
require('../models/User');
const User = mongoose.model('users');

// User Login ROUTE
router.get('/login', (req, res) => {
    res.render('users/login');
}); 

// User register route
router.get('/register', (req, res) => {
    res.render('users/register');
}); 

// Login form POST
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect:'/ideas/home',
        failureRedirect:'/users/login',
        failureFlash: true
    })(req, res, next);
});
// Register form POST
router.post('/register', (req, res) => {
    let errors = [];

    if(req.body.password != req.body.password2){
        errors.push({text:'Passwords do not match'});
    }

    if(req.body.password.length < 4){
        errors.push({text:'Password must be atleast 4 characters'});
    }

    if(req.body.phone.length < 10){
        errors.push({text:'Phone number must contain 10 characters'});
    }

    if(req.body.phone.length > 10){
        errors.push({text:'Phone number must contain 10 characters'});
    }

    if(errors.length>0){
        res.render('users/register', {
            errors: errors,
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            date_of_birth: req.body.date_of_birth,
            phone: req.body.phone,
            password: req.body.password,
            password2: req.body.password2
        });
    } else {
        User.findOne({email: req.body.email})
          .then(user => {
              if(user){
                  req.flash('error_msg', 'Email already registered');
                  res.redirect('/users/register');
              } else {
                const newUser = new User({
                    fname: req.body.fname,
                    lname: req.body.lname,
                    date_of_birth: req.body.date_of_birth,
                    phone: req.body.phone,
                    email: req.body.email,
                    password: req.body.password
                });
                
                bcrypt.genSalt(10, (err,salt) => {
                    bcrypt.hash(newUser.password, salt, (err,hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                          .then(user => {
                              req.flash('success_msg', 'You are now registered and can login');
                              res.redirect('/users/login');
                          })
                          .catch(err => {
                              console.log(err);
                              return;
                          });
                    });
                });

              }
          });

        
    }

    /*console.log(req.body);
    res.send('register');*/
}); 

//Logout User
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

// User Profile
router.get('/profile', ensureAuthenticated, function(req, res) {

    res.render('users/profile', { 
        _id: req.user._id,
        fname: req.user.fname,
        lname: req.user.lname,
        email: req.user.email,
        date_of_birth: req.user.date_of_birth,
        phone: req.user.phone
    });
});

module.exports = router;