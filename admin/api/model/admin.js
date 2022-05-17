const mongoose = require("mongoose")
const schema = mongoose.Schema
const Admin = new schema({
    user_name: {
        type: String,
    },
    // last_name:{
    //     type:String
    // },
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
    confirm_password:{
        type:String
    },
    // role:{
    //     type: Number,
    // },
    // hash_transaction:{
    //     type:String
    // },
    otp:{
        type:Number
    },
    is_delete:{
        type:Boolean,
        default:false
    }  
    
},{ timestamps: true }, { strict: false });
var detail = mongoose.model("Admin", Admin)
module.exports = detail