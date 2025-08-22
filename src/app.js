const express = require('express');
const cookiePerser = require('cookie-parser')
const app = express();
app.use(express.json());
app.use(cookiePerser());



module.exports = app