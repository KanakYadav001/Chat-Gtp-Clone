require('dotenv').config()
const mongo = require('mongoose')

function ConnectToDB(){
    mongo.connect(process.env.DB_KEY)
    .then(()=>{
        console.log("Connect To DB")
    })
    .catch((err)=>{
      console.log(err)
    })
}

module.exports=ConnectToDB