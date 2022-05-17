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
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        default: ''
    },
    confirmpassword:{
        type:String
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
    status:{
        type:Boolean,
        default:true
    },
    is_delete:{
        type:Boolean,
        default:false
    } 
    
},{ timestamps: true }, { strict: false });
var detail = mongoose.model("Users", Users)
module.exports = detail