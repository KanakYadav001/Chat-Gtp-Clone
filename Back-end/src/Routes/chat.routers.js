const express = require('express')
const authMiddleware = require('../middleware/auth.middelware')
const chatController = require('../controllers/chat.controller');
const router = express.Router();


router.post('/',authMiddleware.authUser,chatController.createChat);


router.get('/history', authMiddleware.authUser, chatController.getChatHistory);

// GET request to fetch all messages for a specific chat
router.get('/:chatId/messages', authMiddleware.authUser, chatController.getChatMessages);


module.exports=router