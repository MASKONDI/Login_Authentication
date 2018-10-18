const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const bcrypt=require('bcryptjs');

const userSchema =new Schema({
	email : String,
	username:String,
	password :String,
	secretToken : String,
	active: Boolean,
},{
	timestamps:
	{
		createdAt:'createdAt',
		updatedAt:'updatedAt'
	}
});
const User =mongoose.model('user',userSchema);
module.exports=User;
module.exports.hashPassword=async (password)=>
{
	try
	{
		const salt =await bcrypt.genSalt(10);
		return await bcrypt.hash(password,salt);
	}catch(error)
	{
		throw new Error('Hashing failed',error);
	}
};
module.exports.comparePasswords =async (inputPassword,hashPassword)=>{
	try {
		bcrypt.compare(inputPassword,hashPassword);
	}catch(error)
	{
		throw new Error('Comparing failed',error);
	}
}; 

