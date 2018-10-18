const passport =require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User=require('../models/user');
const flash = require('connect-flash');
//passport serialize user
passport.serializeUser((user,done) =>
{
done(null,user.id);//user id should store on session
});

//passport deserialize user
passport.deserializeUser(async(id,done)=>{
	try{
		const user= await User.findById(id);
		done(null,user);

	}catch(error)
	{
		done(error,null);
	}
});
//passport use
passport.use('local',new LocalStrategy({
	usernameField:'email',
	passwordField:'password',
	passReqToCallback:false
},async (email,password,done)=>
{
	try
	{
		//check if email is already exist
		const user=await User.findOne({'email':email});
		if(!user)
		{
			return done(null,false, { message: 'Unknown User'});
		}
		//check password is correct
		const isValid=User.comparePasswords(password,user.password);
		if(!isValid)
		{
			return done(null,false, { message: 'Unknown password'});	
		}
		//check if account has been verified
		if(!user.active)
		{
			return done(null,false,{message: 'You need to verify email frist'});
		}
		return done(null,user);
		

	}
	catch(error)
	{
		return done(error,false);
	}
}));