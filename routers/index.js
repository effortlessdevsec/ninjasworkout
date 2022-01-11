const express = require('express');
const router = express.Router();
const app = express();
var bodyParser = require('body-parser');  
const mongoose = require("mongoose")
const userSchema = require("../models/user");
const postSchema = require("../models/post");
const flash   = require('connect-flash');
const jwt = require("jsonwebtoken");
const accessTokenSecret = 'hello';
const axios = require('axios');
var autoIncrement = require("mongodb-autoincrement");
var pug = require('pug');
var csrf = require('csurf')
const path = require('path');
var crypto = require("crypto");
var secretstring = crypto.randomBytes(20).toString('hex');
var session = require('express-session');
const validateemail = require('../models/strict')
const Token = require("../models/token");
const config = require('../config/mail')
const sendEmail = require("../utils/sendemail");
const fileUpload = require("express-fileupload");
var serialize = require('node-serialize');

const multer = require('multer');
const needle = require('needle');


var csrfProtection = csrf({ cookie: true })



var cookieparser =require('cookie-parser');
app.use(cookieparser());
app.use(flash());


var cors = require('cors')
const { check,validationResult } = require('express-validator');
const { find } = require('../models/user');

app.use(cors())


app.set('view engine', 'pug');
app.set('views','../views');
app.use(bodyParser.json());

const urlencodedParser = bodyParser.urlencoded({ extended: true })


router.get('/secret/profile',authenticateToken,function (req, res) {
    console.log(req.cookies.Auth);
    //console.log(req.session.user);

    res.render("profile");
    
    })


router.get("/secret/register",function (req, res) {

  res.render('Register'); 
})

router.get("/secret/login",(req, res)=>{

  console.log(secretstring);
    res.render('login',{secrettoken:secretstring});
})

//// login routes  


router.post("/secret/login",urlencodedParser,[
check('username')
    .notEmpty()
      .withMessage('Please input valid email address'),
check('password')
     .notEmpty()
     .withMessage("Please input valid password")


],

(req, res)=>{

    data= {
        
        username: req.body.username,
    
      password : req.body.password
    }

    console.log(data)
    const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).jsonp(errors.array());

    const alert = errors.array()
  }



	 userSchema.findOne({
        username: req.body.username,
        password:req.body.password
     }, 
     function(err, result) {
         if (err) throw err;
         console.log(result);
         //res.json(result);
         if(result==null) {
           return res.render('login',{loginerr:"Invalid User name or password"})
           // return res.status(401).json({
          //      message: "Authentication failed"
         //   });
         }
         else

         {   
          const accessToken = jwt.sign({ username: result.username,  email: result.email, admin: result.admin}, accessTokenSecret);
          console.log(accessToken)
          // const verify =jwt.verify(accessToken,accessTokenSecret);
           res.cookie("Auth",accessToken)
         // console.log()  req.session.user = accessToken;
           global.hello=result.username;

           
          // res.cookie("username",result.username);
           
           // console.log(verify);
           /// req.headers.authorization =   'Bearer '+ accessToken

            //res.setHeader('Authorization', 'Bearer '+ accessToken); 

            //res.redirect('/secret');

res.redirect('/secret/profile');
 //res.json({ username,email:result.email,accessToken });

        }
         //res.redirect('profile')
     });

   


})


//check accessToken

function authenticateToken(req, res, next){
  //  const authHeader = req.headers['authorization'];
    const token =req.cookies.Auth;
   // console.log(req.cookies);
    if(token == null){
      return res.render("auth-error",{message:"You are not authorized"});
     // return res.sendStatus(401);
    }
 
    jwt.verify(token, accessTokenSecret, (err,user) => {
        console.log(user);

        if(err) return  res.render("auth-error",{message:"You are not authorized"}); //res.sendStatus(403)

        req.user = user;
         next()
    })
}

// after login

router.get('/secret/profile', function(req, res){
    //console.log(req)

res.render('profile',{message:"user authenticated"})

})



// strange case


router.post("/secret/?user",urlencodedParser,(req, res)=>{

    console.log(req.query);
   //console.log(req.query.admin);

userSchema.findOne({
        //username: req.body.username,
       // password:req.body.password
       username:req.query.user
     }, 
     function(err, result) {
         if (err) throw err;
        
         
         


         console.log(result);
         res.json(result);
     });


})


//fake test



router.post("/secret/username",urlencodedParser,(req, res)=>{

  console.log(req.body.username);

userSchema.findOne({
      //username: req.body.username,
     // password:req.body.password
     username:req.body.username
   }, 
   function(err, result) {
       if (err) throw err;
      
       
       


       console.log(result);
       res.json(result);
   });


})






/////


///// registration

router.post("/secret/signup",urlencodedParser,[
    check('username')
    .notEmpty()
        .isLength({ min: 3 })
        .not()
        .custom((val) => /[^A-za-z0-9\s]/g.test(val))
        .withMessage('Username not use uniq characters'),
        check('email')
        .notEmpty()
       // .isEmail()
      .withMessage('Please input valid email address')

],validateemail, (req, res)=> {

    //console.log(req.body)
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).jsonp(errors.array());

    const alert = errors.array()
  }

email =req.email;
email =email.toLowerCase();
  const user = new userSchema({
    username: req.body.username,
    email: email,   
    password: req.body.password,
    admin:req.body.admin, // privilege escalation
});

console.log(user);
user.save().then((response) =>
 {

  return res.render('register',{signupmsg: "Account created Successfully!!!!"})
    //res.status(201).json({
     //   message: "User successfully created!",
     //   result: response.message
       
   // });

}).catch(error => {
    res.status(500).json({
        error: error
    });
});

    
  //
//
})


/// new path

router.get('/profile',authenticateToken,(req, res) => {
    res.json(req.user.username);



})



router.get('/secret/addpost',authenticateToken,(req, res) => {

  res.render('create',{secrettoken:secretstring});



})


router.get('/secret/posts/:username',authenticateToken,(req, res) => {

  console.log(req.params);
  postSchema.find({
    username: req.params.username,

 },  function(err, result1) {
    console.log(result1);
  if (err) throw err;

  
  
  else{
    try{
      //console.log(result1[0]);
      jwt.verify(req.cookies.Auth, accessTokenSecret, function (err, payload) {
        console.log(payload)
        if(payload.username){ // broken access control
          //return res.send(result1);
          global.postlimit = result1.length; 
          console.log(postlimit) //length of result
  
  
           res.render('postview',{message:result1,user:payload.username});
        }
        else{
          var input = req.params.username;
      
          res.render('Unauth',{errormessage:"You are Not Auhtorized"});
          //res.status(403).send("Unauthorized");
        }
        

      })



     // var decoded = jwt.verify(req.cookies.Auth,"hello")
     
    }
    catch(err) {
console.log(err)
    }

    
    
    
  }
  
  
 })

})















router.post('/secret/addpost',authenticateToken,(req, res) => {

  console.log(req.body);
  console.log(req.file);
  file = req.file.filename;
  


postSchema.find({

username: hello

},function(err,result) {
 console.log(result.length);
 if(result.length < 2) 


{ 

title= req.body.title
description= req.body.description

//console.log(data);
//sconsole.log(postlimit);
  const post = new postSchema({

    username: hello,
    title: title,
    description: description,
    file:file // privilege escalation
});

post.save().then((response) => {

 return res.render('create',{messagepost:"Post created Successfully"});

}).catch(error => {
  return res.status(500).json({
      error: error
  });
});
}
else
{
  return res.render('create', {limit: "Your Limit Excedded"})
}
})


})



router.get('/secret/logout',(req, res) => {
  res.clearCookie('Auth');
  res.redirect('login');

})


router.get('/secret/forgot',(req, res) => {

  res.render('forgot');
})

router.post('/secret/forgot',urlencodedParser,(req, res) => {
  email1 = req.body.email;
  email =email1.toLowerCase();
  
  userSchema.findOne({
    //username: req.body.username,
   // password:req.body.password
email }, 
 function(err, result) {
     if (err) throw err;
    
     
     console.log(result);



     if(result == null){

      return res.render('forgot',{forgotmsg:"Email Address is not associated with account"}) // User enumeration


     }
     else{
      const resettoken = jwt.sign({ username: result.username,  email: result.email, admin: result.admin}, accessTokenSecret,);
      const resettoken1 = jwt.sign({ username: result.username,  email: result.email, admin: result.admin},'',{algorithm:'none'});

    console.log(resettoken1);
      Token.findOne({ email: result.email},function(err, reset) {

     // console.log(reset);
      if(reset == null) {
        token =  new Token({
          username: result.username,
          email: result.email,
          token: resettoken,
      }).save();

      }
      else {

        Token.updateOne({'token':resettoken},function(err,t1){

          console.log(t1)
        });
        var host = req.get('host');
        req.username =result.username

        const link = `http://${host}/secret/password-reset/${result.username}/${resettoken}`;
        console.log(link)
        sendEmail(email1, "Password reset", link,result.username)

      }

      })
      res.render('forgot',{forgotmsg:" Reset Mail Sent to " + email1})

      //res.json(result);
      
     }
 });


})

router.get("/secret/password-reset/:username/:token", urlencodedParser, (req, res) => {

  try{

    const username = req.params.username;
    console.log(username);
    Token.findOne({username: req.params.username,token: req.params.token},function(err, reset){
      console.log(reset)
      
      if(reset ==null ){
        res.render('resetpassword',{message:"sorry link may be expired"})

      }
      else {
        res.render("resetpassword")
       // res.json(reset)
      }

    })




  }
catch(err){


}

})


router.post("/secret/password-reset/:username/:token", urlencodedParser, (req, res) => {

  console.log(req.params.username)
  token =req.params.token
  //console.log(result)
  var decoded =verify(req.params.token)
  console.log(!decoded.username == req.params.username)
  if(!decoded) {return res.render('resetpassword',{reseterr:"invalid link or expired link"}) ;}
  console.log(decoded.username == req.params.username)
  const usercheck =(decoded.username == req.params.username);

  if(usercheck ==false) {return res.render('resetpassword',{reseterr:"invalid link or expired link"}) ;}
else
{
  const filter = { username: req.params.username };
  
  const update = { password: req.body.password };
    
     let doc =  userSchema.findOneAndUpdate(filter, update, {
      new: true
     },function(err, doc) {
       console.log(doc);
    });
    res.render("resetpassword",{resetpassmsg:"password reset sucessfully."});
  }
  //reset.delete();
  
  // const resettoken = Token.findOne({username: req.params.username,token: req.params.token},function(err, reset){
  //   console.log(reset)
  //   if(reset == null) {return res.render('resetpassword',{reseterr:"invalid link or expired link"}) ;}
  // userSchema.findOne({username: req.params.username},function(err, result){
  //   if(err) {throw err}
  
  //   if(result == null){ return  res.render('resetpassword',{reseterr:"Your token is invalid"}) }
  //   const data={
  //     password: req.body.password
  //   }
  //   const filter = { username: req.params.username };
  //   const update = { password: req.body.password };
    
  //   let doc =  userSchema.findOneAndUpdate(filter, update, {
  //     new: true
  //   },function(err, doc) {
  //     console.log(doc);
  //   });
    

    
  //   res.render("resetpassword",{resetpassmsg:"password reset sucessfully."});
  //   reset.delete();

  
  // })

  //})

  

  

})
function verify(token) {
  var decoded = false;
  jwt.verify(token, accessTokenSecret, function (err, payload) {
    if (err) {
      decoded = false; // still false
    } else {
      decoded = payload;
    }
  });
  return decoded;
}


////////////////////



router.post('/secret/postcheck',(req, res) => {

console.log(JSON.stringify(req.body));
res.send(req.file);

//res.send(JSON.stringify(req.body));

})


///ssrf ////////////////////////

router.get('/secret/', function(request, response){
  var params = request.params;
  var url = request.query['url'];
  if (request.query['mime'] == 'plain'){
var mime = 'plain';
  } else {
var mime = 'html';
  };

  console.log('New request: '+request.url);

  needle.get(url, { timeout: 3000 }, function(error, response1) {
    if (!error && response1.statusCode == 200) {
      response.writeHead(200, {'Content-Type': 'text/'+mime});
      response.write('<h1>Welcome to Ninzas\'s SSRF demo.</h1>\n\n');
      response.write('<h2>I am an application. I want to be useful, so I requested: <font color="red">'+url+'</font> for you\n</h2><br><br>\n\n\n');
      console.log(response1.body);
      response.write(response1.body);
      response.end();
    } else {
      response.writeHead(404, {'Content-Type': 'text/'+mime});
      response.write('<h1>Welcome to Ninzas\'s SSRF demo.</h1>\n\n');
      response.write('<h2>I wanted to be useful, but I could not find: <font color="red">'+url+'</font> for you\n</h2><br><br>\n\n\n');
      response.end();
      console.log('error')

    }
  });
})


/// insecure deserialization leads to replace

router.post('/secret/shell',urlencodedParser,authenticateToken,function(req, res){


  console.log(req.body.user);
  if (Object.keys(req.body).length === 0 ) {
    const ser = serialize.serialize(req.body)
   return  res.send("sorry No user defined" + ser)
 }
else {
  const uns = serialize.unserialize(req.body)    // Insecure Deserailiazation => Remote Code Execution
  return   res.send(uns)

}





})

router.get('*',(req, res) => {

  res.render('error');
})

module.exports =router;
