const mongoo = require("mongoose")


const messageScema = new mongoo.Schema({
    user : {
        type : mongoo.Schema.Types.ObjectId,
        ref:"user"
    },
    chat: {
        type : mongoo.Schema.Types.ObjectId,
        ref : "chat"
    },
    content : {
        type : String,
        require:true
    },
    role : {
        type : String,
        enum : ["user", "model" , "system"],
        default : "user"
    }
}, {
    timestamps :true 
})


const messageModel = mongoo.model("message",messageScema)

module.exports = messageModel