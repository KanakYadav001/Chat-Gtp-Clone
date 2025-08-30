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
      if (!cookies.token) {
        return next(new Error("Authentication error : No Token Provided"));
      }

      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      if (!user) {
        return next(new Error("Authentication Error : User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication Error : Invalid Token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ai-message", async (messagePayLoad) => {
      let response = null;

      try {
        // Step 1: Create the message and generate user embedding concurrently
        const [message, userEmbedding] = await Promise.all([
          messageModel.create({
            chat: messagePayLoad.chat,
            user: socket.user._id,
            content: messagePayLoad.content,
            role: "user",
          }),
          aiService.gernateVector(messagePayLoad.content), // keeping original service call
        ]);

        // Step 2: Create memory (vector embedding) for the user message
        await createMemory({
          vectors: userEmbedding,
          messageId: message._id,
          metadata: {
            chat: String(messagePayLoad.chat),
            user: String(socket.user._id),
            text: String(messagePayLoad.content || ""),
            role: "user",
          },
        });

        // Step 3: Query memory and fetch chat history concurrently
        const userId = String(socket.user._id);

        const [memory, chatHistory] = await Promise.all([
          queryMemory({
            queryVector: userEmbedding,
            limit: 3,
            // CRITICAL: Pinecone filter must use operator form like $eq
            metadata: {
              user: { $eq: userId },
            },
            includeMetadata: true, // ensure metadata is returned with matches
          }),
          messageModel
            .find({ chat: messagePayLoad.chat })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
            .then((messages) => messages.reverse()),
        ]);

        // Step 4: Prepare STM and LTM
        const stm = chatHistory.map((item) => ({
          role: item.role,
          parts: [{ text: item.content }],
        }));

        const ltm = [
          {
            role: "user",
            parts: [
              {
                text: `
these are some previous messages from the chat, use them to gernate a response
${(Array.isArray(memory) ? memory : []).map((m) => m.metadata?.text || "").join("\n")}
                `.trim(),
              },
            ],
          },
        ];

        response = await aiService.generateResponse([...ltm, ...stm]);

        // Step 6: Emit the AI response to the client
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
      } finally {
        try {
          if (response) {
            const [responseMessage, modelEmbedding] = await Promise.all([
              messageModel.create({
                chat: messagePayLoad.chat,
                user: socket.user._id,
                content: response,
                role: "model",
              }),
              aiService.gernateVector(response),
            ]);

            await createMemory({
              vectors: modelEmbedding,
              messageId: responseMessage._id,
              metadata: {
                chat: String(messagePayLoad.chat),
                user: String(socket.user._id),
                text: String(response || ""),
                role: "model",
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
