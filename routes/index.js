var express=require("express");
var router=express.Router();
var User=require("../models/user");
var passport=require("passport")
var FrontendFeedback = require("../models/frontendFeedback");
var UtilityFeedback = require("../models/utilityFeedback");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var middlewareObj=require("../middleware")
var fs = require('fs');

router.get("/", function(req, res){
  if(req.isAuthenticated()){
    res.render("landing");
  }else res.redirect("/login");
});

router.post("/",middlewareObj.isLoggedIn,function(req,res){
  var number = req.body.number.toString();
  var mode = req.body.mode.toString();
  var flags = req.body.flags.toString();
  var genesis = req.body.genesis.toString();
  User.findOne({username: req.user.username}, function(err, user){
    if(err){
      return console.log(err);
    }
    user.setting = {
      number_of_nodes : number,
      mode: mode,
      genesis: genesis,
      flags: flags,
    }
    user.save();
  })
  var finalString = "number of nodes="+number + "\n" + mode + "\n" + flags + "\n" ;
  fs.writeFile("/Users/lt/Desktop/block.txt",finalString, function(err) {
      if(err) {
          return console.log(err);
      }
      fs.writeFile("/Users/lt/Desktop/genesis.json",genesis, function(err1) {
          if(err1) {
              return console.log(err1);
          }
         
          console.log("The file was saved!");
          setTimeout(function(){
            res.redirect("http://localhost:3000");
          }, 5000)
      });
      fs.readFile("/Users/lt/Desktop/genesis.json", function(err,data){
        if(err) return console.log(err);
        const genesis_data = JSON.parse(data);
        console.log("Hello");
        console.log(genesis_data);
        console.log(genesis_data.gasLimit);
      })
  });
});

router.get("/smart_contract", function(req, res){
  if(req.isAuthenticated()){
    res.render("smart_contract");
  }else res.redirect("/login");
});

router.post("/smart_contract",middlewareObj.isLoggedIn,function(req,res){
  var smart_contract = req.body.smart_contract.toString();
  var finalString = smart_contract + "\n" ;
  fs.writeFile("/Users/lt/Desktop/Hello.sol",finalString, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The smart_contract is deployed!");
      setTimeout(function(){
        res.redirect("/");
      }, 5000)
  });
});

router.post("/previousSelection",function(req,res){
  var number = req.user.setting.number_of_nodes;
  var mode = req.user.setting.mode;
  var flags = req.user.setting.flags;
  var genesis = req.user.setting.genesis;
  var finalString = "number of nodes="+number + "\n" + mode + "\n" + flags + "\n" ;
  fs.writeFile("/Users/lt/Desktop/block.txt",finalString, function(err) {
      if(err) {
          return console.log(err);
      }
      fs.writeFile("/Users/lt/Desktop/genesis.json",genesis, function(err1) {
          if(err1) {
              return console.log(err1);
          }
         
          console.log("The file was saved!");
          setTimeout(function(){
            res.redirect("http://localhost:3000");
          }, 5000)
      });
      fs.readFile("/Users/lt/Desktop/genesis.json", function(err,data){
        if(err) return console.log(err);
        const genesis_data = JSON.parse(data);
        console.log("Hello");
        console.log(genesis_data);
        console.log(genesis_data.gasLimit);
      })
  });
});

// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

router.get("/learnmore", (req,res)=>{
	res.render("learnmore",{page: 'learnmore'});
})

router.get("/feedback", (req,res)=>{
	res.render("feedback",{page: 'feedback'});
})

router.post("/frontend",middlewareObj.isLoggedIn, (req,res)=> {
  var newFeedback = {
    text: req.body.frontendFeedback,
    author: {
      id: req.user._id,
      username: req.user.username,
    }
  };
  FrontendFeedback.create(newFeedback,function(err,feedback){
      if(err){
          console.log(err)
      }else{
        req.flash("success","Successfully Added Your Feedback")
        res.redirect("/feedback/");
      }
  })
})

router.post("/utility",middlewareObj.isLoggedIn, (req,res)=> {
  var newFeedback = {
    text: req.body.utilityFeedback,
    author: {
      id: req.user._id,
      username: req.user.username,
    }
  };
  UtilityFeedback.create(newFeedback,function(err,feedback){
      if(err){
          console.log(err)
      }else{
        req.flash("success","Successfully Added Your Feedback")
        res.redirect("/feedback/");
      }
  })
})

router.post("/register",function(req,res){
    var newUser= new User({
        username: req.body.username,
        firstName:req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
    });
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            req.flash("error",err.message)
            return res.redirect("/register")
        }
        passport.authenticate("local")(req,res,function(){
            req.flash("success","Successfully Signed In As" + user.username)
            res.redirect("/");
        })
    })
})



//show login form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});
router.post("/login",passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/login"
    }),function(req,res){
});

router.get("/logout",function(req,res){
    req.logout();
    req.flash("success","Successfully Logged You Out")
    res.redirect("/")
})


router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: process.env.GMAILID,
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: process.env.GMAILID,
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'https://' + 'pg-mate.herokuapp.com' + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: process.env.GMAILID,
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: process.env.GMAILID,
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});


module.exports=router;
