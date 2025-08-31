require('dotenv').config()
const app = require('./src/app')
const DB = require('./src/db/db')
const initSocketServer = require('./src/Socket/socket.server');
const httpServer = require('http').createServer(app)
DB();

initSocketServer(httpServer)

httpServer.listen(3000,() =>{
    console.log("Server Is Running On 3000 Port");
})