const express = require("express");
const router = express.Router();
const User = require("../models/User.model")
const bcrypt = require("bcryptjs");

router.get("/login", (req,res)=> {
    res.render("login");
  }); 


  router.post('/login', async (req, res) => {
    const {username, password} = req.body;
    if (username === "" || password === "") {
      res.render("login", 
      {errorMessage: "Indicate username and password"});
      return;
    }
  
    const user = await User.findOne({username})
    if (user === null) {
      res.render("login", 
      {errorMessage: "Invalid login"}); 
      return;
    }

    if (bcrypt.compareSync(password, user.password)){
        //succesful login
        req.session.currentUser = user;
        //res.redirect("/");
        res.render("index", {user});
    
      } else { //password doesn't match
        res.render("login", 
        {errorMessage: "Invalid login"}); 
        return;
      }
    });
      


router.get("/signup", (req,res) => {
    res.render("signup");
  });

  router.post("/signup", async (req,res) => {
    const {username, email, password} = req.body;

    //username & passwords = required feilds
    if (username === "" || password === "") {
    res.render("signup", {errorMessage: "Indicate username and password"});
    return;
    }

   //Password strengh
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/
    if (passwordRegex.test(password) === false) {
    res.render('signup', 
    { errorMessage: 'Password is too weak' })
    return;
    }
  
   //user already exists?
    let user = await User.findOne({username});
    if (user !== null) {
      res.render('signup', 
    { errorMessage: 'Username already exists' })
    return;
    }
  
   //create user in database
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    try{
      await User.create({
        username,
        email,
        password: hashedPassword
      });
      res.redirect("/");  
    } catch(e){
      res.render('signup', 
      { errorMessage: 'Username already exists' })
      
    }
  });

  router.post("/logout", (req,res)=> {
    req.session.destroy();
    res.redirect("/");
  });
  
  

module.exports = router;