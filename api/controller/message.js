const Chat = require("../model/chat");
const Message = require("../model/message");
const User = require('../model/user');
const invoke = require('../fabric/invoke')


exports.allMessages = async (req, res) => {
  try {
    //   console.log("ccccccccccc", req.user)
    if(req.user.role == 1 || req.user.role == 2){
        const update_status = await Message.updateMany({ chat: req.body.chatId, sender: { $ne: req.user._id } }, { $set: { read_status: true } })
    }
     if(req.user.role == 3){
        const update_status = await Message.updateMany({ chat: req.body.chatId, sender: { $ne: req.user._id } }, { $set: { sp_read_status: true } })
    }
    const messages = await Message.find({ chat: req.body.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    var message = []
    messages.forEach(item => {
      var data = {}
      data._id = item._id;
      data.read_status = item.read_status
      data.sender_id = item.sender._id;
      data.sender_email = item.sender.email;
      data.sender_pic = item.sender.pic;
      data.content = item.content;
      data.chat_id = item.chat._id;
      data.chatName = item.chat.chatName;
      data.users = item.chat.users;
      message.push(data)

    })
    if (message.length == 0) {
      return res.json({ statusCode: 400, statusMsg: "Messages not found" })
    } else {
        console.log("message",message)
        message.forEach((item, index)=>{
            if(item.content == ""){
               message.splice(index)
            }
        })
        
      return res.json({ statusCode: 200, message })
    }
    // res.json(messages);
  } catch (error) {
    // res.status(400);
    // throw new Error(error.message);
    res.status(400);
  }
}


exports.sendMessage = async (req, res) => {
    console.log("user", req.user)
  const { content, chatId } = req.body;

//   if (content == "" || content == null || content == undefined) {
//     return res.json({ statusCode: 400, statusMsg: "Please fill Content" })
//   }

  if (chatId == "" || chatId == null || chatId == undefined) {
    return res.json({ statusCode: 400, statusMsg: "Please fill chatId" })
  }
  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    read_status: false
  }

  try {
    var userName = req.user.userName
    var channelName = "mychannel"
    var chaincodeName = "chat-app"
    // var functionName = "UpdateChat"
    // var args = ["sender",req.user.email, content, Date.now()  ]
    var functionName = "InitLedger"
    var args = []
    console.log("messageuser",req.user)
    var result = await invoke.invokeChaincode(userName, channelName, chaincodeName, functionName, args)
    
    if(result.success == true){
      var message = await Message.create(newMessage);
      message = await message.populate("sender", "name pic");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "name pic email",
      });
  
      await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
  
      const messages = await Message.find({ chat: req.body.chatId })
    //   .sort({ updatedAt: -1})
        .populate("sender", "name pic email")
        .populate("chat");
  
      console.log("messages", messages)
      var message = []
      messages.forEach(item => {
        var data = {}
        data._id = item._id;
        data.sender_id = item.sender._id;
        data.read_status = item.read_status
        data.sender_email = item.sender.email;
        data.sender_pic = item.sender.pic;
        data.content = item.content;
        data.chat_id = item.chat._id;
        data.chatName = item.chat.chatName;
        data.users = item.chat.users;
  
        message.push(data)
  
      })  
      if (message.length == 0) {
        return res.json({ statusCode: 400, statusMsg: "Messages not found" })
      } else {
          message.forEach((item, index)=>{
            if(item.content == ""){
               message.splice(index)
            }
        })
        return res.json({ statusCode: 200, message })
      }
    }else{
      console.log("result.message",result)
      return res.json({ statusCode: 400, statusMsg:result.message})
    }
   
  } catch (error) {
    return res.json({ statusCode: 400 , statusMsg:error.message});
    // throw new Error(error.message);
  }
}

