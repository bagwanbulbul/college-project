const express = require('express');
const router = express.Router();
// var router = express.Router();
const {protect} = require("../middleware/authMiddleware")



router.use(express.json());
const bodyParser = require("body-parser");
var multer  = require('multer');


router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json());


const {
    signup,
    userlogin,
    emailVerify,
    verify_email_otp,
    updatePassword,
    changePassword,
    userslist,
    uploadImage,
    getUser,
    updateUser,
    verify_otp,
    forgotPassword

}= require("../controller/user")
// const {protect} = require("../middleware/authMiddleware")

router.post("/userSignup",signup);
router.post("/emailVerify",emailVerify);
router.post("/verify_email_otp",verify_email_otp);
router.post("/updatePassword",updatePassword);
router.post("/changePassword",protect,changePassword);
router.get("/userslist",protect,userslist);
router.post("/userlogin",userlogin);
router.post("/uploadImage", protect,uploadImage);
router.post("/getUser",getUser);
router.post("/updateUser",updateUser);
router.post("/verify_otp",verify_otp);
router.post("/forgotpassword",forgotPassword);



module.exports = router;