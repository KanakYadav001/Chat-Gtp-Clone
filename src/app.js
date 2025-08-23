const express = require('express');
const authRoutes = require('./Routes/auth.routers')
const cookiePerser = require('cookie-parser')
const app = express();
app.use(express.json());
app.use(cookiePerser());
app.use("/api/auth",authRoutes);


module.exports = app