require('dotenv').config()
const app = require('./src/app')
const DB = require('./src/db/db')
DB();



app.listen(3000,() =>{
    console.log("Server Is Running On 3000 Port");
})