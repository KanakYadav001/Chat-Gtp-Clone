const UserModel = require('../models/user.model')
const becrypt = require('bcryptjs')
const jwt  = require('jsonwebtoken')
const cookie = require('cookie-parser')

async function registerUser(req,res) {
    const {fullName : {firstName , lastName},email ,password} = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const userAlreadyExits = await UserModel.findOne({email})

     if(userAlreadyExits){
        return res.status(400).json({
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

    res.cookie("token",token, {
        httpOnly: true, // Makes the cookie inaccessible to client-side scripts
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
        sameSite: 'strict', // Protects against CSRF attacks
    });


    res.status(201).json({
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
       return res.status(401).json({
            message : "Invalid Email Or Password"
        })
    }
    const isPassword = await becrypt.compare(password,user.password)


    if(!isPassword){
       return res.status(401).json({
            message : "Invalid Email Or Password"
        })
    }

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
    res.cookie('token',token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    })

    
    res.status(200).json({
        message :"User Login Sucessfully",
        user :{
           email :user.email,
           _id : user._id,
           Fullname : user.fullName 
        }
    })
}

// New function to get the currently authenticated user
async function getMe(req, res) {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    res.status(200).json({
        user: {
            email: req.user.email,
            _id: req.user._id,
            Fullname: req.user.fullName
        }
    });
}


module.exports = {
    registerUser,
    UserLogin,
    getMe
}
