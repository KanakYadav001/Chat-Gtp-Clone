const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService  = require('../services/ai.service')
const messageModel = require('../models/message.model')


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
   socket.on("ai-message", async (messagePayLoad)=> {
      console.log(messagePayLoad)


      await messageModel.create({
        chat : messagePayLoad.chat,
        user: socket.user._id,
        content : messagePayLoad.content,
        role : "user"
      })
      const response = await aiService.generateResponse(messagePayLoad.content)


       await messageModel.create({
        chat : messagePayLoad.chat,
        user: socket.user._id,
        content : response,
        role : "model"
      })
      socket.emit('ai-response', {
        content:response,
        chat:messagePayLoad.chat
      })
      console.log("Ai-Message",response);
   })
  });
}

module.exports = initSocketServer;
