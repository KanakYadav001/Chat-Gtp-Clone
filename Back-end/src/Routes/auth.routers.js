const express = require('express');
const authController = require('../controllers/user.controller');
const { authUser } = require('../middleware/auth.middelware');
const router = express.Router();


router.post('/register',authController.registerUser);
router.post('/login',authController.UserLogin);
router.get('/session', authUser, authController.checkSession);
router.post('/logout', authController.logoutUser);


module.exports = router
