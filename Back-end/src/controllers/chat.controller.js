const chatModel = require('../models/chat.model')
const messageModel = require('../models/message.model');


async function createChat (req,res) {
  const { title } = req.body ;
  const user = req.user;

  const chat  = await chatModel.create({
    user : user._id,
    title
  })

  // When a chat is created, update its lastActivity timestamp
  chat.lastActivity = Date.now();
  await chat.save();

  res.status(201).json({
    message : "Chat Created Sucessfully",
    chat : {
        _id : chat._id,
        title : chat.title,
        lastActivity : chat.lastActivity,
        user: chat.user
    }
  })
}

// Fetches all chats for the authenticated user
async function getChatHistory(req, res) {
    try {
        const chats = await chatModel.find({ user: req.user._id }).sort({ lastActivity: -1 });
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch chat history" });
    }
}

// Fetches all messages for a specific chat, ensuring the user has access
async function getChatMessages(req, res) {
    try {
        const { chatId } = req.params;
        const chat = await chatModel.findOne({ _id: chatId, user: req.user._id });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found or access denied" });
        }

        const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 'asc' });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch messages" });
    }
}


module.exports= {
    createChat,
    getChatHistory,
    getChatMessages
}
