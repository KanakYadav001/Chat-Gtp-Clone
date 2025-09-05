const express = require('express');
const authController = require('../controllers/user.controller')
const authMiddleware = require('../middleware/auth.middelware');
const router = express.Router();


router.post('/register',authController.registerUser)
router.post('/login',authController.UserLogin);

// New route to get the current user's info based on their cookie
router.get('/me', authMiddleware.authUser, authController.getMe);


 module.exports = router
