const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');


async function createChat (req,res) {
  const { title } = req.body ;
  const user = req.user;

  const chat  = await chatModel.create({
    user : user._id,
    title
  })

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

async function getChatHistory(req, res) {
  try {
    const user = req.user;
    const chats = await chatModel.find({ user: user._id }).sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching chat history' });
  }
}

async function getChatMessages(req, res) {
  try {
    const { chatId } = req.params;
    const user = req.user;

    // Verify chat belongs to the user
    const chat = await chatModel.findOne({ _id: chatId, user: user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 'asc' });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching messages' });
  }
}

async function updateChatTitle(req, res) {
    try {
        const { chatId } = req.params;
        const { title } = req.body;
        const user = req.user;

        const chat = await chatModel.findOneAndUpdate(
            { _id: chatId, user: user._id },
            { title },
            { new: true }
        );

        if (!chat) {
            return res.status(404).json({ message: "Chat not found or user not authorized" });
        }

        res.status(200).json({ message: "Chat title updated successfully", chat });
    } catch (error) {
        res.status(500).json({ message: "Server error updating chat title" });
    }
}

async function deleteChat(req, res) {
    try {
        const { chatId } = req.params;
        const user = req.user;

        const chat = await chatModel.findOne({ _id: chatId, user: user._id });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found or user not authorized" });
        }

        // Delete all messages associated with the chat
        await messageModel.deleteMany({ chat: chatId });
        
        // Delete the chat itself
        await chatModel.deleteOne({ _id: chatId });

        res.status(200).json({ message: "Chat deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error deleting chat" });
    }
}


module.exports= {
    createChat,
    getChatHistory,
    getChatMessages,
    updateChatTitle,
    deleteChat
}

