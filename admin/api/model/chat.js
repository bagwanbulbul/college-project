// const mongoose = require("mongoose")
// const schema = mongoose.Schema
// const Chats = new schema({
//     sender_id: {
//         type: mongoose.Schema.Types.ObjectId,
//     },
//     reciver_id:{
//         type: mongoose.Schema.Types.ObjectId
//     },
//     sender_type: {
//         type: String,
//     },
//     reciver_type:{
//         type:String
//     },
//     message:{
//         type: Array
//     },
//     Date:{
//         type: Date
//     },
//     is_delete:{
//         type:Boolean,
//         default:false
//     }  
    
// },{ timestamps: true }, { strict: false });
// var detail = mongoose.model("Chats", Chats)
// module.exports = detail

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