const mongoo = require('mongoose')

const chatScema = new mongoo.Schema({
  user : {
    type : mongoo.Schema.Types.ObjectId,
    ref : 'user',
    required : true
  },
  title : {
    type : String,
    required : true
  },
  lastActivity :{
    type : Date,
    default : Date.now
  }
}, {
    timestamps : true
})


const chatModel = mongoo.model('chat',chatScema)


module.exports = chatModel