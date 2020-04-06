//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

console.log(process.env.API_KEY);

const app = express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true, useUnifiedTopology: true});

//app.use(express.static("public"));

const userSchema = new mongoose.Schema({
  email:String,
  password:String
});

//var secret = process.env.SOME_LONG_UNGUESSABLE_STRING;

userSchema.plugin(encrypt, { secret:process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User",userSchema);


app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){
  const newUser = new User({
    email:req.body.username,
    password:req.body.password
  });
  newUser.save(function(err){
    if (err){
      res.send(err);
    } else {
      res.render("secrets");
    }
  });
});

app.post("/login",function(req,res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email:username},
    function(err,foundUser){
        if (err){
          res.send(err);
        } else {
          if (foundUser){
            console.log("user found");
            if (foundUser.password === password){
              res.render("secrets");
            }
          } else {
            console.log("user not found");
          }
        }
      });
    });







app.listen(3000,function(req,res){
  console.log("Server listening on port 3000");
});
