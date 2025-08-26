const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService  = require('../services/ai.service')

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
      const response = await aiService.generateResponse(messagePayLoad.content)

      socket.emit('ai-response', {
        content:response,
        chat:messagePayLoad.chat
      })
      console.log("Ai-Message",response);
   })
  });
}

module.exports = initSocketServer;
