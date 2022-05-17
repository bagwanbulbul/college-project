const Admin = require('../model/admin');
const User = require('../model/user');
// const Chat = require("../model/chat");
const Chat = require('../model/chat');
const Message = require("../model/message")

var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer");
// const localstorage = require('node-localstorage').LocalStorage;



var express = require("express");
var app = express();

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: false }))


async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}
async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}



exports.adminSignup = async (req, res) => {
    try {
        const {
            user_name,
            email,
            password,
            confirm_password
        } = req.body
        const hashedPassword = await hashPassword(password);
        const newUser = new Admin({
            user_name: user_name,
            email: email,
            password: hashedPassword,
            confirm_password: confirm_password
        });

        var adminData = await Admin.find({ email: req.body.email })
        if (adminData.length > 0) {
            return res.json({ statusCode: 400, message: "Email alerady exist" })
        }
        let response = new Admin(newUser)
        response.save()
            .then((result) => {
                return res.json({ statusCode: "200", statusMsj: "Successfuly Register", data: result })
            }).catch((err) => {
                console.log(err)
                return res.send(err)
            })
    } catch (error) {
        console.log(error)
        return res.send(error)
    }
}

exports.adminlogin = async (req, res, next) => {
    try {
        var email = req.body.email;
        var password = req.body.password;
        const admin = await Admin.findOne({ email: email });

        if (!admin) {
            return res.json({ statusCode: 401, statusMsj: "Enter valid Email" })
        }
        else {
            const validPassword = await validatePassword(password, admin.password);
            if (!validPassword) {
                return res.json({ statusCode: 402, statusMsj: "Password mismatch" })
            }
            else {
                const accessToken = jwt.sign({
                    adminId: admin._id
                }, 'bulbul', {
                        expiresIn: "1d"
                    });
                await Admin.findByIdAndUpdate(admin._id, {
                    accessToken
                })
                console.log(accessToken)
                return res.json({ statusCode: 200, statusMsj: "login sussessfully", access: accessToken })
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({ statusCode: 400, message: "login failed" })
    }
}

exports.getAll = async(req, res)=>{
   var user_Data = await User.find()
   return res.json({statusCode:200, data:user_Data})
}


exports.getClient = async(req,res)=>{
    try{
        var user_Data = await User.find({role:1, is_delete:false})
        // if(user_Data.length == 0){
        //     return res.json({statusCode:401, message:"Clint not found"})
        // }
        return res.json({statusCode:200, data:user_Data})

    }catch(err){
        console.log(err)
        return res.json(err)
    }
}
exports.getBroker = async(req,res)=>{
    try{
        var user_Data = await User.find({role:2, is_delete:false})
        return res.json({statusCode:200, data:user_Data})

    }catch(err){
        console.log(err)
        return res.json(err)
    }
}
exports.getSupervisor = async(req,res)=>{
    try{
        var user_Data = await User.find({role:3, is_delete:false})
        return res.json({statusCode:200, data:user_Data})

    }catch(err){
        console.log(err)
        return res.json(err)
    }
}

exports.statusManage = async(req, res)=>{
    try{
        var user_id = req.query.user_id;
        var status = req.body.status
        var user_Data = await User.findOne({_id:user_id})
        if(user_Data){
            update_status = await User.updateOne({_id:user_id},{$set:{status:status}});
            return res.json({statusCode:200, message:"status Changed"})
        }else{
            return res.json({statusCode:400, message:"User Not Found"})
        }
    }catch(err){
        console.log(err)
        return res.json(err)
    }
    
}

exports.change_password = async (req, res) => {
    var email = req.body.email
    var oldPassword = req.body.old_password
    var new_password = req.body.new_password
    var confirm_password = req.body.confirm_password

    var admin_Data = await Admin.findOne({ email: email })
    if (!admin_Data) {
        return res.json({ statusCode: 400, statusMsj: "Email not exist" })
    }
    var hash = admin_Data.password

    bcrypt.compare(oldPassword, hash, async (error, isMatch) => {
        if (error) {
            throw error
        } else if (!isMatch) {
            return res.json({ statusCode: 401, message: "Password Not matched" });
        } else {
            if (new_password == confirm_password) {
                const hash_new_passwoed = await hashPassword(new_password);
                Admin.updateOne({ password: hash }, { $set: { password: hash_new_passwoed, confirm_password:confirm_password} })
                    .then(result => {
                        return res.json({ statusCode: 200, statusMsj: "Successfuly Update", data: result })
                        // return res.redirect('http://127.0.0.1:5500/frontend/page-login.html')
                    }).catch(err => {
                        console.log(err)
                        return res.send(err)
                        // return res.redirect("index.html")
                    })
            } else {
                return res.json({ statusCode: 402, statusMsj: "Password Mismatch" })
            }
        }
    })
}

exports.chat = async(req,res)=>{
    try{
        const {sender_id,reciver_id, message}=req.body
        var  sender_type,reciver_type, sender_name, reciver_name
    
        var sender_Data = await User.findById({_id:sender_id})
        if(sender_Data){
            sender_name = sender_Data.first_name + " "+sender_Data.last_name
            if(sender_Data.role == 1){
                sender_type="Client"
            }
            if(sender_Data.role == 2){
                sender_type = "Broker"
            }
        }
        var reciver_Data = await User.findById({_id:reciver_id});
        if(reciver_Data){
            reciver_name = reciver_Data.first_name + " "+ reciver_Data.last_name
            if(reciver_Data.role == 1){
                reciver_type="Client"
            }
            if(reciver_Data.role == 2){
                reciver_type = "Broker"
            }
        }

        var exist_Data = await Chat.findOne({sender_id: sender_id, reciver_id:reciver_id});
        console.log("exist_Data",exist_Data)
        if(exist_Data){
            var message_arr = exist_Data.message
            message_arr.push({"sender_id":sender_id,"reciver_id":reciver_id,"sender_type":sender_type,"reciver_type":reciver_type,"sender_name":sender_name,"reciver_name":reciver_name, "message":message, "Date":Date.now()})
            var update_chat = await Chat.updateOne({_id:exist_Data._id}, {$set:{message:message_arr}, sender_id:sender_id, reciver_id:reciver_id});
            console.log(update_chat)
            return res.json({message:"Chat Updated"})
        }

        var chat_data = await Chat.findOne({sender_id:reciver_id, reciver_id:sender_id});
        if(chat_data){
            var message_arr = chat_data.message
            message_arr.push({"sender_id":sender_id,"reciver_id":reciver_id,"sender_type":sender_type,"reciver_type":reciver_type,"sender_name":sender_name,"reciver_name":reciver_name, "message":message, "Date":Date.now()})
            var update_chat = await Chat.updateOne({_id:chat_data._id}, {$set:{message:message_arr}, sender_id:sender_id, reciver_id:reciver_id});
            console.log(update_chat)
            return res.json({message:"Chat Updated"})
        }

        const newUser = new Chat({
            sender_id: sender_id,
            reciver_id: reciver_id,
            // sender_type: sender_type,
            // reciver_type: reciver_type,
            message:[{"sender_id":sender_id,"reciver_id":reciver_id,"sender_type":sender_type,"reciver_type":reciver_type,"sender_name":sender_name,"reciver_name":reciver_name, "message":message, "Date":Date.now()}],
            Date: Date.now()
        });
        // console.log("newUser",newUser)
        let response = new Chat(newUser)
        response.save()
            .then((result) => {
                return res.json({ statusCode: "200", data: result })
            }).catch((err) => {
                console.log(err)
                return res.send(err)
            })
    }catch(err){
        console.log(err)
        return res.json(err)
    }
 
}

exports.getClinetAllChat = async(req,res)=>{
    var client_id = req.query.client_id
    var client = await User.findOne({role:1, _id:client_id})
    console.log("client",client)
    if(!client || client == null || client == undefined){
        return res.json({statusCode:400,message:"Client Not found"})
    }
    var client_chats = await Chat.find({users:{$in:client._id}})
    if(!client_chats){
        return res.json({statusCode:400,message:"Chat Not found"})
    }
    var message = []
    client_chats.forEach( async item=>{
        const messages = await Message.find({ chat: item._id }).sort({ _id: -1 })
        .populate("sender", "name pic email")
        .populate("chat");
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
    })
    setTimeout(()=>{
        console.log("message", message)
        if(message.length === 0){  
            return  res.json({statusCode:400,statusMsg:"chat not created"})
        }   
        else{
            return  res.json({statusCode:200,chat:message})
        }
    },2000);  
}

exports.getBrokerAllChats = async(req,res)=>{
    var broker_id = req.query.broker_id
    var broker_chats = await Chat.find( { $or: [ { sender_id: broker_id}, { reciver_id:broker_id } ] })
    console.log("client", broker_chats)
    if(!broker_chats){
        return res.json({statusCode:400,message:"Chat Not found"})
    }
    return res.json({statusCode:200,chats:broker_chats})
}


exports.getChatById = async(req, res)=>{
    var chat_id = req.query.chat_id
    var chats = await Chat.findOne({_id:chat_id})
    return res.json({statusCode: 200, chats:chats})
}

exports.CountUsers = async(req, res)=>{
    var all_users = await User.find()
    var total_client = 0;
    var total_broker = 0;
    var total_supervisor = 0;
    all_users.forEach((item)=>{
        if(item.role == 1){
            total_client++
        }
        if(item.role == 2){
            total_broker++
        }
        if(item.role == 3){
            total_supervisor++
        }
    })
    return res.json({statusCode:200, total_client:total_client, total_broker:total_broker, total_supervisor:total_supervisor})
}

exports.getAllChat = async(req, res)=>{
    var client_id = req.query.client_id
    if(!client_id || client_id == undefined){
        var chats = await Chat.find().populate("users", " role first_name last_name pic email");
        return res.json({statusCode:200,data:chats})
    }
    var chats = await Chat.find({users:{$in:client_id}}).populate("users", " role first_name last_name pic email");
    // var chats = await Chat.find().populate("users", " role first_name last_name pic email");
    console.log("chats",chats)
    var newArr = []
    chats.forEach(item=>{
        if(item.users.length>=2){
            var obj = {_id:item._id}
            if(item.users[0].role==1 && item.users[1].role==1){
                obj.clientToclient = item.users[0].first_name+" "+item.users[0].last_name +" And "+item.users[1].first_name+" "+item.users[1].last_name
            }else{
                obj.clientToBroker = item.users[0].first_name+" "+item.users[0].last_name +" And "+item.users[1].first_name+" "+item.users[1].last_name
            }
            newArr.push(obj)
        }
    })
    console.log("newArr",newArr)
    return res.json({statusCode:200,data:chats})
}

exports.getMessage = async(req, res)=>{
    var chat_id = req.query.chat_id
    var message = await Message.find({chat:chat_id})
    .populate({ path: 'chat', populate: { path: 'users',select: 'role first_name last_name' } 
    })
    var messages = []
    message.forEach(item=>{
        var obj = {
            _id:item._id,
            Message:item.content,
           date:item.updatedAt
        }
        if(item.sender.equals(item.chat.users[0]._id)){
            obj.Sender=item.chat.users[0].first_name + " "+item.chat.users[0].last_name
            obj.Reciver=item.chat.users[1].first_name + " "+item.chat.users[1].last_name
        }else{
            obj.Sender=item.chat.users[1].first_name + " "+item.chat.users[1].last_name
            obj.Reciver=item.chat.users[0].first_name + " "+item.chat.users[0].last_name
        }
        messages.push(obj)
        console.log("array",messages)
    })
    return res.json({data:messages})
}

// exports.supervisorChat = async(req, res)=>{
    
// }