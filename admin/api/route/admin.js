// adminSignup

const express = require('express');
const router = express.Router();


const {
   
    adminSignup,
    adminlogin,
    getClient,
    getBroker,
    getSupervisor,
    statusManage,
    change_password,
    chat,
    getAllChat,getClinetAllChat,getBrokerAllChats,getChatById, CountUsers,getMessage
       // logout,
   
}
=require('../controller/admin');
router.post("/signup",adminSignup);
router.post("/login",adminlogin);
router.get("/getClient",getClient);
router.get("/getBroker",getBroker);
router.get("/getSupervisor",getSupervisor);
router.post("/statusManage",statusManage);
router.post("/change_password",change_password);
router.post("/chat",chat);
router.get("/getAllChat",getAllChat);
router.get("/getClinetAllChat",getClinetAllChat);
router.get("/getBrokerAllChats",getBrokerAllChats);
router.get("/getChatById",getChatById);
router.get("/CountUsers",CountUsers);
router.get("/getMessage",getMessage)


module.exports = router;