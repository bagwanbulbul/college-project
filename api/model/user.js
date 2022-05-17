const mongoose = require("mongoose")
const schema = mongoose.Schema
const Users = new schema({
    first_name: {
        type: String,
    },
    last_name:{
        type:String
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        default: '',
    },
    confirmpassword:{
        type:String,
    },
    pic:{
       type:String,
       default:"https://www.w3schools.com/howto/img_avatar2.png"
    },
    role:{
        type: Number,
    },
    hash_transaction:{
        type:String
    },
    otp:{
        type:Number
    },
    verifiy:{
        type:Number,
        default:0
    },
    is_delete:{
        type:Boolean,
        default:false
    },
    orgName:{
        type:String
    },
    userName:{
        type:String
    }
    
}, {timestamps:true, strict: false });
var User = mongoose.model("Users", Users)
module.exports = User