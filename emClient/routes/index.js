var express = require('express');
var bodyParser = require('body-parser');
var { UserClient } = require('./UserClient')
var router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated } = require('../helpers/auth');

//Load Idea Model
require('../models/Idea');
const Idea = mongoose.model('ideas');
const multer = require('multer');

//Load User Model
require('../models/User');
const User = mongoose.model('users');

//Load Orders Model
require('../models/Order');
const Order = mongoose.model('orders');

//Load Orders Model
require('../models/cart');
const Cart = mongoose.model('cart');

/* GET home page. */
router.get('/home', ensureAuthenticated,async (req, res) => {
  const count = await Cart.countDocuments({user:req.user.id})
  var counter = false;
  if (count > 0) {
    counter = true
  
  }
  console.log(count)


  Idea.find({
    exp_date1: {$gt: new Date().toISOString()}
  }).lean()

      .sort({ date: 'desc' })
      .then(ideas => {
          res.render('home2', {
              ideas: ideas,
              count:count,
              counter:counter

          });
      });
    
  console.log(res.body)
});

/* GET Event Registration page. */
router.get('/registration', (req, res) => {
  res.render('Registration');
});
/* GET home page. */
router.get('/',  function (req, res, next) {
  res.render('Home');
});

// User registration
router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/login',  (req, res) => {
  res.render('login');
});

router.post('/register',async (req, res) => {

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
      res.render('register', {
          errors: errors,
          fname: req.body.fname,
          lname: req.body.lname,
          email: req.body.email,
          date_of_birth: req.body.date_of_birth,
          phone: req.body.phone,
          password: req.body.password,
          password2: req.body.password2,
          

      });
  } else {
      User.findOne({email: req.body.email})
        .then(user => {
            if(user){
                req.flash('error_msg', 'Email already registered');
                res.redirect('/register');
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
                            res.redirect('/login');
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

// Login form POST
router.post('/login', (req, res, next) => {

  passport.authenticate('local', {
      successRedirect:'/home',
      failureRedirect:'/login',
      failureFlash: true     
  })(req, res, next);
});

//Logout User
router.get('/logout',async (req, res) => {

  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});



function isLoggedIn(req, res, next){

  // if user is authenticated in the session, carry on 
  if (req.isAuthenticated())
  return next();
  
  // if they aren't redirect them to the home page
  res.redirect('/');
}

// User Profile
router.get('/profile',async function(req, res) {
  const count = await Cart.countDocuments({user:req.user.id})
  var counter = false;
  if (count > 0) {
    counter = true
  
  }

  res.render('profile', { 
      _id: req.user._id,
      fname: req.user.fname,
      lname: req.user.lname,
      email: req.user.email,
      date_of_birth: req.user.date_of_birth,
      phone: req.user.phone,
      
      count:count,
      counter:counter
  });
});





//Uploads page
router.get('/uploads',async (req, res) => {
  const count = await Cart.countDocuments({user:req.user.id})
  var counter = false;
  if (count > 0) {
    counter = true
  
  }

  Idea.find({
    
    user: req.user.id
  }).lean()
    .sort({ date: 'desc' })
    .then(ideas => {
      res.render('uploads', {
        ideas: ideas,
        count:count,
        counter:counter

      });
      console.log(res.body)
    });
});



//cart page
router.get('/cart', ensureAuthenticated,async  (req, res) => {
  const count = await Cart.countDocuments({user:req.user.id})
  var counter = false;
  if (count > 0) {
    counter = true
  
  } 
  console.log(req.user.id)
  Cart.find({
      user: req.user.id
  }).lean()
  .then(idea => {
      res.render('cart', {
          ideas: idea,
          count:count,
          counter:counter

      });
      console.log(idea)
  })
});


//Add/remove from cart

router.get('/cart/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
})
    .then(idea => {

      idea.cart = true;
      idea.save()
            // .then(idea => {
            //     res.redirect('back');
            // })
    });


  Idea.findOne({
      _id: req.params.id
  })
      .then(idea => {
       

          const newUser = {
              category: idea.category,
              name: idea.name,
              price: idea.price,
              exp_date: idea.exp_date,
              exp_date1: idea.exp_date1,
              pkd_date: idea.pkd_date,
              quantity: idea.quantity,
              user: req.user.id,
              discount: idea.discount,
              image: idea.image,
              newprice: idea.newprice,
              cart: idea.cart,
              date: idea.date,
              order:idea.order,
              wishlist:idea.wishlist,
              product_id:idea.id
             
              
          };
        
          new Cart(newUser)
           .save()
           .then(order => {
              res.redirect('/cart');
          })

      });



});



router.delete('/cart/:id/:product', ensureAuthenticated, (req, res) => {

Cart.remove({ _id: req.params.id })

Idea.findOne({
  _id: req.params.product
})
  .then(idea => {

    idea.cart = false;
    idea.save()
          // .then(idea => {
          //     res.redirect('back');
          // })
  });
  Cart.remove({ _id: req.params.id })
  .then(idea => {
    // res.redirect('back');
})

});
//Orders

router.get('/orders', ensureAuthenticated, (req, res) => {
  Order.find({user: req.user.id}).lean()
      .sort({ date: 'desc' })
      .then(orders => {
          res.render('orders', {
              orders: orders
          });
      });
  console.log(res.body)
});


router.get('/orderconfirm/:id', ensureAuthenticated, (req, res) => {

  Idea.findOne({
      _id: req.params.id
  }).lean()
      .then(idea => {
          res.render('orderconfirm', {
              idea: idea
          });
      });

});

router.post('/orders', (req, res) => {
  const d = new Date().toLocaleDateString().split(",")[0];
  const newUser = {
      product_id: req.body.product_id,
      name: req.body.name,
      price: req.body.price,
      exp_date: req.body.exp_date,
      pkd_date: req.body.pkd_date,
      quantity: req.body.quantity,
      discount: req.body.discount,
      newprice:((100-req.body.discount)*req.body.price)/100,
      address: req.body.address,
      user: req.user.id,
      date: d
  };

  new Order(newUser)
   .save()
   .then(order => {
      res.redirect('/orders');
  })
}); 


router.delete('/orders/:id', ensureAuthenticated, (req, res) => {
  Order.remove({ _id: req.params.id })
      .then(() => {
          res.redirect('/orders');
      });
});


//wishlist

router.get('/wishlist',async (req, res) => {
  const count = await Cart.countDocuments({user:req.user.id})
  var counter = false;
  if (count > 0) {
    counter = true
  
  }
  Idea.find({
      exp_date1: {$gt: new Date().toISOString()},
      wishlist: true
  }).lean()

      .then(ideas => {
          
          res.render('wishlist', {
            ideas: ideas,
            count:count,
            counter:counter
          });          
      });
  // console.log(res.body)
});

//add/remove Wishlist
router.get('/wishlist/:id', (req, res) => {


  Idea.findOne({
      _id: req.params.id
  })
      .then(idea => {
          
          if(idea.wishlist){
              idea.wishlist = false;
          }
          else{
              idea.wishlist = true;
          }
          


          idea.save()
              // .then(idea => {
              //     res.redirect('back');
              // })
      });
});

//Search page
router.get('/search',async (req, res) => {
  const count = await Cart.countDocuments({user:req.user.id})
  var counter = false;
  if (count > 0) {
    counter = true
  
  }

  try {
      Idea.find({ $or: [{ name: { '$regex': req.query.search, $options: '-i' },
      exp_date1: {$gt: new Date().toISOString()}
     }] }, (err, ideas) => {
          if (err) {
              console.log(err);
          } else {
              res.render('home2', {
                ideas: ideas,
                count:count,
                counter:counter
              });
          }
      }).lean()
          .sort({ date: 'desc' })
  } catch (error) {
      console.log(error);
  }
});

//category filter page

//filter page

router.post('/filter', ensureAuthenticated,async (req, res) => {
  const count = await Cart.countDocuments({user:req.user.id})
  var counter = false;
  if (count > 0) {
    counter = true
  
  }
    console.log();
    console.log(req.body.max_price);
    console.log(req.body.discount);
    Idea.find({
        exp_date1: {$gt: new Date().toISOString()},
        category: req.body.category,
        discount: {$gt: req.body.discount},
        newprice: { $gt: req.body.min_price, $lt: req.body.max_price }
    }).lean()

        .then(ideas => {
            console.log(ideas)
            res.render('home2', {
              ideas: ideas,
              count:count,
              counter:counter
            });
        });
});


//category sort

router.get('/category/:id',async  (req, res) => {
  const count = await Cart.countDocuments({user:req.user.id})
  var counter = false;
  if (count > 0) {
    counter = true
  
  }

  if (req.params.id == 'low_to_high') {
      Idea.find({exp_date1: {$gt: new Date().toISOString()}}).lean()
          .sort({ newprice: '1' })
          .then(ideas => {
              res.render('home2', {
                ideas: ideas,
                count:count,
                counter:counter

              });
          });
  }
  else if (req.params.id == 'high_to_low') {
      Idea.find({exp_date1: {$gt: new Date().toISOString()}}).lean()
          .sort({ newprice: '-1' })
          .then(ideas => {
              res.render('home2', {
                ideas: ideas,
                count:count,
                counter:counter

              });
          });
  }

  else if (req.params.id == 'newest') {
      Idea.find({exp_date1: {$gt: new Date().toISOString()}}).lean()
          .sort({ date: 'desc'  })
          .then(ideas => {
              res.render('home2', {
                ideas: ideas,
                count:count,
                counter:counter

              });
          });
  }
  else if (req.params.id == 'closest') {
      Idea.find({exp_date1: {$gt: new Date().toISOString()}}).lean()
          .sort({ exp_date: '1' })
          .then(ideas => {
              res.render('home2', {
                ideas: ideas,
                count:count,
                counter:counter

              });
          });
  }
  else if (req.params.id == 'discount') {
      Idea.find({exp_date1: {$gt: new Date().toISOString()}}).lean()
          .sort({ discount: '-1' })
          .then(ideas => {
              res.render('home2', {
                ideas: ideas,
                count:count,
                counter:counter

              });
          });
  }


});



router.post('/registration', async function (req, res) {
  
  upload(req, res, async function (err) {
    if (err) {
      let errors = [];
      
      
      

      if (!req.body.category) {
          errors.push({ text: 'Please add a category' });
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
    console.log(req.file.filename);

    const private = 'f3a1481d1070fef4acc125c9830d1a0c34423fcc3ad4fd2a93f09f45625f6347'
    const data1 = private

    const data2 = req.body.name;
    const data3 = req.body.exp_date;
    const data4 = req.body.pkd_date;
    const data5 = req.body.price;
    const data6 = req.body.discount;
    const data7 = req.body.category;
    const data8 = req.body.quantity;
    const data9 = req.file.filename;

    const cart = false;
    const order = false;
    const d = new Date();
    const newUser = {

      category: data7,
      name: data2,
      price: data5,
      exp_date: data3,
      exp_date1: data3,
      pkd_date: data4,
      quantity: data8,
      discount: data6,
      image: data9,
      user:req.user.id,
      newprice: ((100 - data6) * data5) / 100,
      cart: cart,
      order: order,
      date: d,
      wishlist: cart


    }

    new Idea(newUser)
      .save()
      .then(async idea => {
        console.log("Data sent to REST API");
        var client = new UserClient();
        let clientExist = await client.addRegistration("Registration", data1, data2, data3, data4, data5, data6, data7, data8, data9);

        if (clientExist == 1) {
          res.redirect('/uploads')
        }
        else if (clientExist == 0) {
          res.send({ message: "Registration Already Exist" });
        }
        
      })



  });
});





router.get('/state/:id', async function (req, res) {
  const count = await Cart.countDocuments({user:req.user.id})
  var counter = false;
  if (count > 0) {
    counter = true
  
  }
  Idea.findOne({
    name: req.params.id
  }).lean()

    .then(async idea => {
      var data1 = idea.name;
      console.log(data1 + " data1 from index");
      var client = new UserClient();
      var getData = await client.result(data1);
      console.log("Data got from REST API", getData);
      if (getData == 1) {
        res.send({ balance: "There is no Event Data in the Queried state address" });
      }
      else {
        Cart.findOne({
          product_id: idea._id,
        }).lean()
        .then( cart => {
      
        res.render('Details', {
          idea: idea,
          balance: getData,
          count:count,
          counter:counter,
          cart:cart
        });
      });

      }
    });
});




/**
 * @title deleteData
 * @dev  Function to delete the details of the Event's 
 */
 router.delete('/delete/:id', async function (req, res) {
  Idea.remove({ name: req.params.id })
  .then(async idea => {
    const private = 'f3a1481d1070fef4acc125c9830d1a0c34423fcc3ad4fd2a93f09f45625f6347'
    const data1 = private
   
    var data2 = req.params.id;
    console.log(data1 + " data1 from index");
    var client = new UserClient();
    let clientExist = await client.deleteData("deleteState", data1, data2)
    if (clientExist == 1) {
      res.redirect('/uploads');
    }
    else if (clientExist == 0) {
      res.send({ message: "Event on " + data2 + " Does not Exist " });
    }
     
  });

})



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


module.exports = router;
