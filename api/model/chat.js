const mongoose = require("mongoose")
const schema = mongoose.Schema
const Chats = new schema(
    {
        chatName:{type:String,trim:true},
        isGroupChat:{type:Boolean,default:false},
         users:[{
            type:schema.Types.ObjectId,
             ref: 'Users'
          
         }],
        latestMessage:{
            type:schema.Types.ObjectId,
            ref:"Messages" 
        },
        groupAdmin:{
            type:schema.Types.ObjectId,
            ref:"Users"
        }
    
},{timestamps:true, strict: false});


const Chat = mongoose.model("Chats", Chats)
module.exports = Chat