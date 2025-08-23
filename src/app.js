const express = require("express");
const cookieParser = require("cookie-parser");

const authRoutes = require("./Routes/auth.routers");
const chatRoutes = require("./Routes/chat.routers");


const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use('/api/chat',chatRoutes)

module.exports = app;
