const UserModel = require('../models/user.model')
const becrypt = require('bcryptjs')
const jwt  = require('jsonwebtoken')
const cookie = require('cookie-parser')

async function registerUser(req,res) {
    const {fullName : {firstName , lastName},email ,password} = req.body;

    const userAlreadyExits = await UserModel.findOne({email})

     if(userAlreadyExits){
        res.status(400).json({
            message : "User Already Exits"
        })
    }

    const hashPassword = await becrypt.hash(password,10);

    const user = await UserModel.create({
        fullName : {
            firstName,lastName
        },
         email ,
         password : hashPassword 
        
    })
   
    const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

    res.cookie("token",token);


    res.status(200).json({
        message :"User Registered Sucessfullt",
        user :{
           email :user.email,
           _id : user._id,
           fullName : fullName
        }
    })
   
}




module.exports = {
    registerUser
}