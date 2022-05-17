
const User = require('../model/user');
const registerUser = require('../fabric/registerUser')
const invoke = require("../fabric/invoke")
var bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require("nodemailer")
var multer  = require('multer');

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}
function betweenRandomNumber(min, max) {  
    return Math.floor( Math.random() * (max - min + 1) + min )
}
async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

exports.signup = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            password,
            confirmpassword,
            orgName
        } = req.body
        var role = req.body.role       //client:1, broker:2, supervisor:3
        if (req.body.role == "Client") {
            role = 1;
        } if (req.body.role == "Broker") {
            role = 2;
        }
        if (req.body.role == "Supervisor") {
            role = 3;
        }

        if(first_name == undefined || first_name == ""){
        	return res.json({statusMsj:403,statusMsj:"please fill First Name"})
        }
        if(last_name == undefined || last_name == ""){
        	return res.json({statusMsj:403,statusMsj:"please fill Last Name"})
        }
        if(email == undefined || email == ""){
        	return res.json({statusMsj:403,statusMsj:"please fill Valid Email"})
        }
        if(password == undefined || password == ""){
        	return res.json({statusMsj:403,statusMsj:"please fill Password"})
        }
         if(confirmpassword == undefined || confirmpassword == ""){
        	return res.json({statusMsj:403,statusMsj:"please fill confirmpassword"})
        }
         if(role == undefined || role == ""){
        	return res.json({statusMsj:403,statusMsj:"please fill role"})
        }
        if (password != confirmpassword) {
            return res.json({ statusCode: 401, message: "Pasword Mismatch" })
        }

        var hash_transaction = crypto.randomBytes(8).toString('hex');
        console.log("hash_transaction  1 ", hash_transaction.length)
        const hashedPassword = await hashPassword(password);

        var otp = betweenRandomNumber(1000, 9999)
        console.log("otp", otp)

        var UserData = await User.findOne({ email: req.body.email})

        console.log("userdata", UserData)
        if (UserData != null) {
            if(UserData.verifiy == 0){
                User.findOneAndUpdate({email: req.body.email},{$set:{otp:otp}},(err,updateOTP)=>{
                    if(err){
                        return res.json({statusCode:400,statusMsj:err});
                    }
                    else{
                        return res.json({statusCode:200,statusMsj:"Please verify your email",otp:"Your otp is ",otp,  _id:UserData._id});
                    }
                })
            }else if(UserData.verifiy == 1){
                return res.json({statusCode:400,statusMsj:"email already exist"})
            }
        }
        else{
            var userName = first_name+last_name
            var result = await registerUser.registerUser(userName, orgName, password)

            console.log("result", result.success)
            if(result.success == true){
                const newUser = new User({
                    first_name: first_name,
                    last_name: last_name,
                    userName:first_name+last_name,
                    email: email,
                    password: hashedPassword,
                    confirmpassword: confirmpassword,
                    role: role,
                    // pic: pic,
                    orgName:orgName,
                    hash_transaction: hash_transaction
                });
                newUser.set({'otp':otp})
                var savedata = await newUser.save()
                
                let transporter = nodemailer.createTransport(
                {
                    service: "gmail",
                    secure: false,
                    auth: {
                        user: "bulbul.infograins@gmail.com",
                        pass: "BulBul@123"
                    },
                    tls: { rejectUnauthorized: false }
                }
                );
    
                let mailOptions = {
                    from: "bulbul.infograins@gmail.com",
                    to: email,
                    subject: "Your OTP",
                    html: "OTP - " + otp
                };

                transporter.sendMail(mailOptions, function (error) {
                    if (error) {
                        console.log(error);
                        // return res.send(error);
                    }
                    else {
                        console.log("Server is ready to take our messages");
                        // return res.json({ 
                        //     statusCode: 200, 
                        //     statusMsj: "Successfully registered and enrolled user " + userName + " and imported it into the wallet",
                        //     data: savedata })
                        // return res.json({ statusCode: 200, statusMsj: "mail send", otp: otp })
                    }
                });
                return res.json({ 
                    statusCode: 200, 
                    statusMsj: "Successfully registered and enrolled user " + userName + " and imported it into the wallet",
                    data: savedata })
            }else{
                return res.json({statusCode:400,statusMsj:result.message })
            }
        }

        // console.log("api calling")
        // let transporter = nodemailer.createTransport(
        //     {
        //         service: "gmail",
        //         secure: false,
        //         auth: {
        //             user: "bharti.infograins@gmail.com",
        //             pass: "Bharti@12345"
        //         },
        //         tls: { rejectUnauthorized: false }
        //     }
        // );

        // let mailOptions = {
        //     from: "bharti.infograins@gmail.com",
        //     to: email,
        //     subject: "Your OTP",
        //     html: "OTP - " + otp
        // };

        // transporter.sendMail(mailOptions, function (error) {
        //     if (error) {
        //         
        //         console.log(error);
        //            return res.send(error);
        //     }
        //     else {
        //         console.log("Server is ready to take our messages");
        //         return res.json({ statusCode: 200, statusMsj: "mail send", otp: otp })
        //     }
        // });
    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
        return res.json({statusCode: 400, statusMsj: error.message})
    }
}


exports.emailVerify = async (req, res) => {
    var email = req.body.email
    var otp = Math.floor(Math.random() * 11111)

    var add_otp = await User.updateOne({ email: req.body.email }, { $set: { otp: otp } })

    let transporter = nodemailer.createTransport(
        {
            service: "gmail",
            secure: false,
            auth: {
                user: "bulbul.infograins@gmail.com",
                pass: "BulBul@123"
            },
            tls: { rejectUnauthorized: false }
        }
    );
    let mailOptions = {
        from: email,
        to: email,
        subject: "Your OTP",
        html: "OTP - " + otp
    };
    transporter.sendMail(mailOptions, function (error) {
        if (error) {
            res.send(error);
            console.log(error);
        }
        else {
            console.log("Server is ready to take our statusMsjs");
            return res.json({ statusCode: 200, statusMsj: "mail send", otp: otp })

        }
    });
}

exports.verify_email_otp = async (req, res) => {
   
    var otp = req.body.otp;
    var _id = req.body._id;

    const accessToken = jwt.sign({
        userId: _id
    }, 'bulbul', {
        expiresIn: "1d"
    });
    
    var user_data = await User.findById({ _id: _id })

    console.log("user", user_data)
    if (!user_data) {
        return res.json({ statusCode: 400, statusMsj: "Email Not found" })
    }
    console.log("req.body", req.body)
    console.log("otp", otp)

    if (user_data.otp == otp) {
        var verify = await User.updateOne({ _id: _id }, { $set: { verifiy: 1 , accessToken } })
        var data = await User.findById({ _id: _id })   
        return res.json({ statusCode: 200, statusMsj: "Email Verfication Successfully done", data: data })
    }

    if (user_data.otp != otp) {
        return res.json({ statusCode: 401, statusMsj: "Wrong OTP" })
    }
}

exports.updatePassword = async (req, res) => {
    var _id = req.body._id;
    var password = req.body.password

    const hashedPassword = await hashPassword(password);

    var data = await User.findOneAndUpdate({ _id:_id }, { $set: { password: hashedPassword, confirmpassword: password } })
    if (!data) {
        return res.json({ statusCode: 400, statusMsj: 'password not updated' })
    } else {
        return res.json({ statusCode: 200, statusMsj: "Password updated" })
    }

}

exports.changePassword = async (req, res) => {
  
    var _id=req.user._id;
    // console.log("userId",userId)
    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;

    var data = await User.findOne({ _id: _id })
    console.log("data", data)

    const validOldPassword = await validatePassword(oldPassword, data.password);
    if (!validOldPassword) return res.json({ statusCode: 402, statusMsj: 'incorrect old password' })

    const hashedPassword = await hashPassword(newPassword);

    var result = await User.findOneAndUpdate({ _id: _id }, { $set: { password: hashedPassword, confirmpassword: newPassword } })
    if (!result) {
        return res.json({ statusCode: 400, statusMsj: "bad Request" })
    } else {
        return res.json({ statusCode: 200, statusMsj: "Password successfully change!" })
    }
}

exports.userslist = async (req, res) => {

    const keyword = req.query.search ? { first_name: { $regex: req.query.search, $options: "i" }, role: { $ne: 3 } } : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id }, role:{$ne:3}});
    if(users.length == 0){
        return res.json({statusCode:400,statusMsj:"User not available"})
    }else{
        return res.json({ statusCode: 200, statusMsj: "User List",users:users })
    }
}

exports.getUser = async (req, res) => {
    User.findById({ _id: req.body.id })
        .then((result) => {
            if (!result) {
                return res.json({ statusCode: 400, statusMsj: "Data Not Found" })
            }
            return res.json({ statusCode: 200, data: result })
        }).catch((err) => {
            console.log(err)
            return res.json({ statusCode: 500, statusMsj: "Something went wrong" })
        })
}

exports.forgotPassword = async (req, res) => {
    var email = req.body.email
    var otp =betweenRandomNumber(1000, 9999)
    var data = await User.findOne({ email: req.body.email })
    console.log("add_otp", data)
    if(!data){
        return res.json({statusCode:400, statusMsj:"Enter valid email"})
    }
    var add_otp = await User.findOneAndUpdate({ email: req.body.email }, { $set: { otp: otp } })
    console.log("add_otp",add_otp._id)

    var smtpTransport = nodemailer.createTransport({
        host :'smtp.gmail.com',
        secureConnection :false,
        port:587,
        auth : {
            user: "bulbul.infograins@gmail.com",
            pass: "BulBul@123"    
        }
    });
    var mailOptionsNoAttachment={
        from:"bulbul.infograins@gmail.com",
        to : email,
        subject : "Your OTP" ,
        html: "OTP - " + otp
    }
    smtpTransport.sendMail(mailOptionsNoAttachment, function(error, response){
        if(error){
            console.log(error);
            return res.send(error);
            
        }
        else{
            console.log("Server is ready to take our statusMsjs");
            return res.json({ statusCode:200,statusMsj:"mail send", otp:otp,UserId:add_otp._id})
        }
    });
}

exports.verify_otp = async (req, res) => {
    var otp = req.body.otp;
    var _id = req.body._id;

    var user_data = await User.findOne({ _id: _id })
    console.log("userdata",_id)

    if (!user_data) {
        return res.json({ statusCode: 400, statusMsj: "Email Not found" })
    }
    if (user_data.otp != otp) {
        return res.json({ statusCode: 401, statusMsj: "Wrong OTP" })
    } return res.json({statusCode: 200, statusMsj: "Verification successfully" })
}

exports.getUserById = async (req, res) => {
    User.find({ is_delete: false, role: 1, role: 2 }).then((result) => {
        if (!result) {
            return res.json({ statusCode: 400, statusMsj: "Data Not Found" })
        }
        return res.json({ statusCode: 200, data: result })
    }).catch((err) => {
        return res.json({ statusCode: 500, statusMsj: "Something went wrong" })
    })
}

exports.updateUser = async (req, res) => {
    var userId = req.query._id
    // var first_name = req.body.first_name;
    // var last_name = req.body.last_name;
    // var pic = req.body.pic;
    
    var updateData = {}
    
    if(req.body.first_name){
        updateData.first_name = req.body.first_name
    }
    
     if(req.body.last_name){
        updateData.last_name = req.body.last_name
    }
    
     if(req.body.pic){
        updateData.pic = req.body.pic
    }
    
    var data = await User.findOneAndUpdate({ _id: userId }, { $set: updateData })

    // var data = await User.findOneAndUpdate({ _id: userId }, { $set: { first_name: first_name, last_name: last_name, pic: pic } })
    if (!data) {
        return res.json({ statusCode: 400, statusMsj: "User Not found", })
    } else {
        return res.json({ statusCode: 200, statusMsj: "profile updated successfully" })
    }
}

exports.userlogin = async (req, res, next) => {
    try {
        const {
            email,
            password,
            role
        } = req.body;
    
        if(email == undefined || email == ""){
        	return res.json({statusMsj:403,statusMsj:"please fill Valid Email"})
        }
         if(password == undefined || password == ""){
        	return res.json({statusMsj:403,statusMsj:"please Enter your Password"})
        }
         if(role == undefined || role == ""){
        	return res.json({statusMsj:403,statusMsj:"please Enter your Role"})
        }
        const user = await User.findOne({ email });
        console.log("user", user)


        if (!user) return res.json({ statusCode: 401, statusMsj: 'Email does not exist!' });
        
        if(user.verifiy == 0){
            return res.json({statusCode: 203, statusMsj:"Please verify your email"})
        }
        if (!role) return res.json({ statusCode: 401, statusMsj: "Role Required" })

        if (user.role != role) {
            return res.json({ statusCode: 403, statusMsj: "Incorrect Role" })
        }
        const validPassword = await validatePassword(password, user.password);
        if (!validPassword) return res.json({ statusCode: 402, statusMsj: 'Password is not correct' })

        const accessToken = jwt.sign({
            userId: user._id
        }, 'bulbul', {
            expiresIn: "1d"
        });
        await User.findByIdAndUpdate(user._id, {
            accessToken
        })
        console.log(accessToken)
        var userName = user.userName
        var channelName = "mychannel"
        var chaincodeName = "chat-app"
        var functionName = "InitLedger"
        var args=[]
        var result = await invoke.invokeChaincode(userName, channelName, chaincodeName, functionName, args)
        if(result.success == true){
            return res.json(
                {statusCode: 200, 
                statusMsj: "Transaction has been submitted successfully",
                chaincodeResponse:result.chaincodeResponse,
                accessToken:accessToken,
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                pic: user.pic
                
            })
        }else{
            return res.json(
                {statusCode: 400, 
                statusMsj: result.message,
            })
        }
    } catch (error) {
        // console.log(error);
        // return res.json({ statusCode: 500, statusMsj: "login failed" })
        console.error(`Failed to submit transaction: ${error}`);
        return res.json({statusCode: 500, statusMsj: error.message})
    }
}



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./images");
    },
    filename: (req, file, cb) => {
            var extensionsGet = file.originalname;
            extensionsGet = extensionsGet.split('.');
            extensionsGet = extensionsGet[1];
            console.log("extensionsGet",extensionsGet);

            if(extensionsGet === "png" ||extensionsGet === "jpg" ||extensionsGet === "jpeg"){
                console.log("extensionsGet","1");
                if(file){
                    console.log("extensionsGet","2",file);
                    cb(null, file.originalname.replace(/ /g, ""))
                }
            }
            else{
                console.log("extensionsGet","3");
                cb({
                    statusCode:403,
                    statusMsj:file.originalname+" Image Not saported. Upload valid image"
                });
            }
    }
});
const upload = multer({storage: storage}).single('image');

exports.uploadImage = async(req, res)=>{
    upload (req, res, err =>{
        console.log("req",req.file)
        console.log("image",req.file.filename)
        if(req.file == undefined || req.file == null){
            return res.json({statusCode:403, statusMsj: "pleas select image"})
        }
        if(err){
            return res.json({statusCode:200, statusMsj: err});
        }
        else{
            console.log("process.env.BASE_URL",process.env.BASE_URL)
            var BASE_URL = "http://148.72.244.170:3000/images/"
            console.log("req.file.filename",req.file.filename)
            User.updateOne({_id:req.user._id}, {$set:{pic:BASE_URL+req.file.filename}}).then(data=>{
                console.log("pic update", data)
            }).catch(err=>{
                return res.json({statusCode:400, statusMsj: err})
            })
            return res.json({statusCode:200, statusMsj: "image uploaded", image:BASE_URL+req.file.filename})
        }
    })
}

