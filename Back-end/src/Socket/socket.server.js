const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
      if (!cookies.token) return next(new Error("No token"));

      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Auth error"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ai-message", async (messagePayLoad) => {
      let response = null;
      let chat = null;
      let userId = null;

      try {
        const { chat: chatId, content } = messagePayLoad;
        chat = chatId;
        userId = String(socket.user._id);

        // Create user message and generate embedding
        const [message, userEmbedding] = await Promise.all([
          messageModel.create({
            chat: chatId,
            user: socket.user._id,
            content,
            role: "user",
          }),
          aiService.gernateVector(content),
        ]);

        // Store user message in vector database
        await createMemory({
          vectors: userEmbedding,
          messageId: message._id,
          metadata: { 
            chat: chatId, 
            user: userId, 
            text: content, 
            role: "user" 
          },
        });

        // Query memory and get chat history
        const [memory, chatHistory] = await Promise.all([
          queryMemory({
            queryVector: userEmbedding,
            limit: 3,
            filter: { user: userId }, // Simple Pinecone format - no $eq operator
          }),
          messageModel
            .find({ chat: chatId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
            .then((messages) => messages.reverse()),
        ]);

        // Prepare conversation context
        const stm = chatHistory.map((item) => ({
          role: item.role,
          parts: [{ text: item.content }],
        }));

        const ltm = [
          {
            role: "user",
            parts: [
              {
                text: `Previous messages:\n${memory
                  .map((m) => m.metadata?.text || "")
                  .join("\n")}`,
              },
            ],
          },
        ];

        // Generate AI response
        response = await aiService.generateResponse([...ltm, ...stm]);

        // Send response to client
        socket.emit("ai-response", { content: response, chat: chatId });
        console.log("AI Message:", response);

      } catch (error) {
        console.error("Error in ai-message handler:", error);
        socket.emit("ai-response", {
          content: "Something went wrong.",
          chat: messagePayLoad.chat,
          error: true,
        });
      } finally {
        // Store AI response if generated successfully
        try {
          if (response && chat && userId) {
            const [aiMessage, modelEmbedding] = await Promise.all([
              messageModel.create({
                chat,
                user: socket.user._id,
                content: response,
                role: "model",
              }),
              aiService.gernateVector(response),
            ]);

            await createMemory({
              vectors: modelEmbedding,
              messageId: aiMessage._id,
              metadata: { 
                chat, 
                user: userId, 
                text: response, 
                role: "model" 
              },
            });
          }
        } catch (error) {
          console.error("Error creating response message/embedding:", error);
        }
      }
    });
  });
}

module.exports = initSocketServer;
