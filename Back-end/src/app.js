const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./Routes/auth.routers");
const chatRoutes = require("./Routes/chat.routers");


const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Your front-end URL
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use('/api/chat',chatRoutes)

module.exports = app;