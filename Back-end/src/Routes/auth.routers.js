const express = require('express');
const authController = require('../controllers/user.controller')
 const router = express.Router();


router.post('/register',authController.registerUser)
router.post('/login',authController.UserLogin);


 module.exports = router