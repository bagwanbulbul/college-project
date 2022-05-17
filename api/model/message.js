const mongoose = require("mongoose")
const schema = mongoose.Schema
const message = new schema(
    {
        sender : {
            type:schema.Types.ObjectId,
            ref:"Users"
        },
        content : {
            type:String,
            trim:true
        },
        chat:{
            type:schema.Types.ObjectId,
            ref:"Chats"
        },
        read_status:{
            type: Boolean,
            default:false
        },
        sp_read_status:{
            type: Boolean,
            default:false
        }
     
    }
,{
    timestamps:true, strict: false
});


const Message = mongoose.model("Messages", message)
module.exports = Message