const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./Routes/auth.routers");
const chatRoutes = require("./Routes/chat.routers");

const app = express();

app.use(
  cors({
    origin: "https://chat-gtp-clone.onrender.com", // Your front-end URL
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);


app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
