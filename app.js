var session = require('express-session');


const express = require('express');
const app = express();
const path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
const dbConfig = require('./database/db');
var cookieparser =require('cookie-parser');
const csurf = require('csurf');
var multer = require('multer');
var upload = multer();
const rateLimit = require("express-rate-limit");
const fileupload = require("express-fileupload");
//app.use('/images', express.static(__dirname + '/images'));
blinker = require("express-blinker"); //directory traversal
basePath = path.join(__dirname, "images");
console.log(basePath)
const limiter = rateLimit({
    max: 30,
    windowMs: 1 * 60 *1000 ,
    //message:"sorry "
    
})

app.use(blinker(basePath, [
  {
      test: /.*/,
      etag: true,
      lastModified: false,
      cacheControl: true,
      expires: false,
      age: 600
  }
]));



const imageStorage = multer.diskStorage({
    // Destination to store image     
    destination: 'images', 
      filename: (req, file, cb) => {
       // console.log(file.originalname)
        //console.log("fil extension"+ path.extname(file.originalname))

          cb(null, file.fieldname + '_' + Date.now() 
             + path.extname(file.originalname))
            // file.fieldname is name of the field (image)
            // path.extname get the uploaded file extension
    }
  });
  
  
  const imageUpload = multer({
    storage: imageStorage,
    limits: {
      fileSize: 1000000 // 1000000 Bytes = 1 MB
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(png|jpg)$/)) { 
         // upload only png and jpg format
      //   console.log(file.originalname)
      console.log("fil extnsion"+path.extname(file.originalname))
      //   console.log(file)
         return cb(file.originalname)
       }
     cb(undefined, true)
     //console.log(file)

  }
  }) 

  app.use(imageUpload.single('file'))









//app.use(upload.single()); 
//app.use(cookieparser())
//app.use(setRefererToNull); 
app.use(limiter);

app.use(session({
  
    // It holds the secret key for session
    secret: 'Your_Secret_Key',
  
    // Forces the session to be saved
    // back to the session store
    resave: true,
  
    // Forces a session that is "uninitialized"
    // to be saved to the store
    saveUninitialized: false
}))

 // app.use(csrfMiddleware);


app.use(cookieparser());
 // Middleware 

//const { User, validate } = require('./models/user');
//global.document = new JSDOM(html).window.document;
app.engine('pug', require('pug').__express)

app.set('view engine', 'pug');
app.set('views','./views');

//app.use(express.static(__dirname + '/public'));


app.use(require('serve-static')('public'));



//app.use('/', express.static(__dirname + '/public'));
app.get('/home', function (req, res) {
  res.sendFile('./home.html', { root: __dirname });
  //console.log(req.query.id);

});






mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Database connected')
},
    error => {
        console.log("Database can't be connected: " + error)
    }
)

app.get("/", function (req, res, next) {
    return res.redirect('./home.html', { root: __dirname });
});




//mongoose.set('useCreateIndex', true);

const userrouter = require("./routers/index");
const { nextTick } = require('process');


app.use(userrouter);



app.listen(3000,() => console.log("server is listening on port 3000"));
