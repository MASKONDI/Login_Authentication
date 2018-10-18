 const express = require('express');
const router = express.Router();
const joi =require('joi');
const User =require('../models/user');
const flash = require('connect-flash');
const passport 	 = require('passport');
const randomstring=require('randomstring');
const mailer=require('../misc/mailer');
//check  if input data was correct( on server-side)
//validate schema
const userSchema=joi.object().keys({
	email:    joi.string().email().required(),
	username: joi.string().required(),
	password: joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
	confirmationPassword: joi.any().valid(joi.ref('password')).required()
});


//Autherization
const isAuthenticated = (req,res,next)=> 
{
if (req.isAuthenticated()){
	return next();
}
else
{
	req.flash('error','Sorry, but you must be registered first!');
	res.redirect('/');
}
};
const isNotAuthenticated = (req,res,next)=> 
{
if (req.isAuthenticated()){

	req.flash('error','Sorry, but you are already logged in');
	res.redirect('/');

}
else
{
	return next();
}
};
 
router.route('/register')
  .get(isNotAuthenticated,(req, res) => { 
    res.render('register');
  })
  // to get signup data
   .post(async (req, res, next) => {
   //console.log('req.body',req.body); //for cmd view
	try
	{ 
   		const result=joi.validate(req.body,userSchema);
   		//console.log('result',result);    //for cmd view
  		if(result.error)
  		{
  			req.flash('error','data is not valid Please try again');
  			res.redirect('/users/register');
  			return;
  		}

  		// Checking if email is already taken
  		const user = await User.findOne({'email':result.value.email});
		if(user)
		{
			req.flash('error','Email is already in use.');
			res.redirect('/users/register');	
			return;
		}

		//Hash the Password
		const hash =await User.hashPassword(result.value.password);
		//console.log('hash',hash); //for cmd view

		//Email verification
		const secretToken=randomstring.generate();
		console.log('secretToken',secretToken);
		result.value.secretToken=secretToken; 	
		//flag the account is inactive
		result.value.active=false;

		//Save user to DB
		delete result.value.confirmationPassword;
		result.value.password=hash;
		//console.log('new value',result.value); //for cmd view
		const  newUser= await new User(result.value);
		console.log('newUser',newUser);
		await newUser.save();


		 //compose as email
		 const html=`Hi ! there, <br/>Thank you for registering!<br/><br/>Please verify your email by the typing following Tocken <br/>Token:<b>${secretToken}</b><br/><br/>on the following page: <a href="http://localhost:5000/users/verify" target="_blank">http://localhost:5000/users/verify</a><br/><br/>HAve a pleasent day!`;

		 await mailer.sendEmail('admin@acf.com',result.value.email,'please verify your email',html);

		req.flash('success','plaese check your email');
		res.redirect('/users/login');
	}
		catch(error)
			{
			next(error);
			}
  });
 


router.route('/login') 
  .get(isNotAuthenticated,(req, res) => {
    res.render('login');
  })
  .post(passport.authenticate('local',{
  	successRedirect:'/users/dashboard',
  	failureRedirect:'/users/login',
  	failurelash:true
  }));

router.route('/verify')
.get(isNotAuthenticated,(req,res)=>
{
res.render('verify');
})  
.post(async (req,res,next)=>
{
	try{
const { secretToken }=req.body;
//find the account that match
await User.findOne({'secretToken':secretToken});
if(!user)
{
	req.flash('error','no user find');
	res.redirect('/users/verify');
	return;
}
user.active=true;
user.secretToken="";
await user.save();

req.flash('succes','Thanks you! now you may login.');
res.redirect('/users/login');
}
catch(error){next(error);}
});



router.route('/dashboard')
.get(isAuthenticated,(req,res)=>{
	//console.log('req.user',req.user);  //for cmd view
	res.render('dashboard',{
	username:req.user.username   //used for usename after the login
});
});
router.route("/logout")
.get(isAuthenticated,(req,res)=>{
	req.logout();
	req.flash('success','SuccessFully Logged out, Hope to see you soon!!!!');
	res.redirect('/');
})
module.exports = router;