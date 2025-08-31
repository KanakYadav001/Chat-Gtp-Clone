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
            firstName,
            lastName
        },
         email ,
         password : hashPassword 
        
    })
   
    const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

    res.cookie("token",token);


    res.status(200).json({
        message :"User Registered Sucessfully",
        user :{
           email :user.email,
           _id : user._id,
           Fullname : user.fullName
        }
    })

   
}

async function UserLogin(req,res){
    const {email,password} =req.body;

    const user = await UserModel.findOne({
        email
    })

    if(!user){
        res.status(400).json({
            message : "Invalid Email Or Password"
        })
    }
    const isPassword = await becrypt.compare(password,user.password)


    if(!isPassword){
        res.status(400).json({
            message : "Invalid Emial Or Password"
        })
    }

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
    res.cookie('token',token)

    
    res.status(200).json({
        message :"User Login Sucessfully",
        user :{
           email :user.email,
           _id : user._id,
           fullName : user.fullName
        }
    })
}




module.exports = {
    registerUser,
    UserLogin
}