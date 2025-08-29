const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory , queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    if (!cookies.token) {
      next(new Error("Authentication error : No Token Provided"));
    }

    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);

      socket.user = user;

      next();
    } catch (err) {
      next(new Error("Authentication Error : Invalid Token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ai-message", async (messagePayLoad) => {



      const message = await messageModel.create({
        chat: messagePayLoad.chat,
        user: socket.user._id,
        content: messagePayLoad.content,
        role: "user",
      });

      const Vectors = await aiService.gernateVector(messagePayLoad.content);

      await createMemory({
        Vectors,
        messageId: message._id,
        metadata: {
          chat: messagePayLoad.chat,
          user: socket.user._id,
          text :messagePayLoad.content

        },
      });

      const chatHistory = (
        await messageModel
          .find({
            chat: messagePayLoad.chat,
          })
          .sort({ createdAT: -1 })
          .limit(20)
          .lean()
      ).reverse();

      const response = await aiService.generateResponse(chatHistory.map(item=> {
           return {
            role: itme.role,
            parts: [{ text: itme.content }],
          
        }
    }));

      const responseMessages = await messageModel.create({
        chat: messagePayLoad.chat,
        user: socket.user._id,
        content: response,
        role: "model",
      });

      const responseVectors = await aiService.gernateVector(response);

      await createMemory({
        Vectors: responseVectors,
        messageId : responseMessages._id,
        metadata : {
           chat: messagePayLoad.chat,
           user: socket.user.id,
           text : response
        }
      });

      socket.emit("ai-response", {
        content: response,
        chat: messagePayLoad.chat,
      });
      console.log("Ai-Message", response);
    });
  });
}

module.exports = initSocketServer;
