const express = require('express')
const authMiddleware = require('../middleware/auth.middelware')
const chatController = require('../controllers/chat.controller');
const router = express.Router();


router.post('/',authMiddleware.authUser,chatController.createChat);

module.exports=router