const express = require('express')
const authMiddleware = require('../middleware/auth.middelware')
const chatController = require('../controllers/chat.controller');
const router = express.Router();


router.post('/',authMiddleware.authUser,chatController.createChat);

// Get all chats for the logged-in user
router.get('/history', authMiddleware.authUser, chatController.getChatHistory);

// Get all messages for a specific chat
router.get('/:chatId/messages', authMiddleware.authUser, chatController.getChatMessages);

// Update a chat title
router.put('/:chatId', authMiddleware.authUser, chatController.updateChatTitle);

// Delete a chat and its messages
router.delete('/:chatId', authMiddleware.authUser, chatController.deleteChat);


module.exports=router

