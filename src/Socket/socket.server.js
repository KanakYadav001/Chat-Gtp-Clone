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
      if (!cookies.token) return next(new Error("Authentication error : No Token Provided"));

      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      if (!user) return next(new Error("Authentication Error : User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication Error : Invalid Token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ai-message", async (messagePayLoad) => {
      try {
        const message = await messageModel.create({
          chat: messagePayLoad.chat,
          user: socket.user._id,
          content: messagePayLoad.content,
          role: "user",
        });

       
        const userEmbedding = await aiService.gernateVector(messagePayLoad.content);

        const memory = await queryMemory({
          queryVector:userEmbedding,
          limit:3,
          metadata : {}
        })
        if (!Array.isArray(userEmbedding) || !userEmbedding.every((n) => typeof n === "number")) {
          throw new Error("Embedding generation failed for user message");
        }

       
        await createMemory({
          vectors: userEmbedding, 
          messageId: message._id,
          metadata: {
            chat: messagePayLoad.chat,
            user: String(socket.user._id),
            text: messagePayLoad.content,
            role: "user",
          },
        });

      console.log(memory);
        const chatHistory = (
          await messageModel
            .find({ chat: messagePayLoad.chat })
            .sort({ createdAt: -1 }) 
            .limit(20)
            .lean()
        ).reverse();

        
        const stm = chatHistory.map(item =>{
          return { 
             role: item.role, 
             parts: [{ text: item.content }], 
          }
        });
     

        const ltm = [
          {
            role : "user",
            parts : [{text :`
              
              these are some previous messages from the chat, use them to gernate a response
              ${memory.map(item=>item.metadata.text).join("\n")}
              ` }]
          }
        ]
        console.log(ltm[0]);
         console.log(stm)
        const response = await aiService.generateResponse([...ltm,...stm]);

      
        const responseMessage = await messageModel.create({
          chat: messagePayLoad.chat,
          user: socket.user._id,
          content: response,
          role: "model",
        });

        
        const modelEmbedding = await aiService.gernateVector(response);
        if (!Array.isArray(modelEmbedding) || !modelEmbedding.every((n) => typeof n === "number")) {
          throw new Error("Embedding generation failed for model response");
        }

        await createMemory({
          vectors: modelEmbedding, 
          messageId: responseMessage._id,
          metadata: {
            chat: messagePayLoad.chat,
            user: String(socket.user._id), 
            text: response,
            role: "model",
          },
        });

        
        socket.emit("ai-response", {
          content: response,
          chat: messagePayLoad.chat,
        });
        console.log("Ai-Message", response);
      } catch (err) {
        console.error("ai-message handler error:", err);
        socket.emit("ai-response", {
          content: "Sorry, something went wrong.",
          chat: messagePayLoad.chat,
          error: true,
        });
      }
    });
  });
}

module.exports = initSocketServer;
