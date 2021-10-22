
const validateemail =function(req, res, next){

    var validRegex = /^[a-zA-Z0-9.!#$&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*.com$/;
    email = req.body.email;
    console.log(   validRegex.test(email)   )
    const validation = validRegex.test(email);
    if(validation == true) {
       regex = new RegExp('.*(@ninjasworkout.com)$') // WEAK REGEX IMPLEMENTATION
       const Orgemail = regex.test(email)
       console.log(Orgemail)
       if(Orgemail== true) return res.send("sorry please crate account with another domain mail address")
 
       req.email = email;
       return next();
        
 
    }
 
    else  return res.render('register',{invalidemail:"PLease input valid email address: "+email})
    
 
 
 }
 
 
 
 
 
 
 module.exports =validateemail;
 