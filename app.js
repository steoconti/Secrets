//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption");
//const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

console.log(process.env.API_KEY);

const app = express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true, useUnifiedTopology: true});

mongoose.set("useCreateIndex",true);

//app.use(express.static("public"));

const userSchema = new mongoose.Schema({
  email:String,
  password:String
});

//var secret = process.env.SOME_LONG_UNGUESSABLE_STRING;

//userSchema.plugin(encrypt, { secret:process.env.SECRET, encryptedFields: ["password"] });
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/secrets",function(req,res){
  if (req.isAuthenticated()){
    res.render("secrets")
  } else {
    res.redirect("/login");
  }
});

app.post("/register",function(req,res){
  // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  //     // Store hash in your password DB.
  //     const newUser = new User({
  //       email:req.body.username,
  //       password: hash
  //     });
  //     newUser.save(function(err){
  //       if (err){
  //         res.send(err);
  //       } else {
  //         res.render("secrets");
  //       }
  //     });
  //   });
  User.register({username:req.body.username},req.body.password,function(err,user){
      if (err){
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req,res,function(){
          res.redirect("/secrets");
        });
      }
  });
});

app.post("/login",function(req,res){
  // const username = req.body.username;
  // const password = req.body.password;
  //
  // User.findOne({email:username},
  //   function(err,foundUser){
  //       if (err){
  //         res.send(err);
  //       } else {
  //         if (foundUser){
  //           console.log("user found");
  //           bcrypt.compare(password, foundUser.password, function(err, result) {
  //             if (!err){
  //               if (result===true){
  //                 res.render("secrets");
  //               }
  //             }
  //           });
  //         } else {
  //           console.log("user not found");
  //         }
  //       }
  //     });
    const user= new User({
      username: req.body.username,
      password: req.body.password
    });

    req.login(user,function(err){
      if(err){
        console.log(err);
      } else {
        passport.authenticate("local")(req,res,function(){
          res.redirect("/secrets");
        });
      }
    });
  });

  app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
  });







app.listen(3000,function(req,res){
  console.log("Server listening on port 3000");
});
