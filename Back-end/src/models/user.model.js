const mongo = require('mongoose');

const UserScema = new mongo.Schema({
    email : {
     type : String,
     unique : true,
     required : true

},
fullName : {
  firstName : { 
     type : String,
     required : true
  },
  lastName :{
     type : String,
     required : true
  }
},
password :{
     type : String,
     required : true
}

} ,{
    timestamps : true
   }
 )


const UserModel = mongo.model('user',UserScema)

module.exports=UserModel