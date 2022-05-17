const express = require("express")
const router = express.Router();
const {protect} = require("../middleware/authMiddleware")

const {
    fetchchat,createChat,allChat,
    deleteall
}= require("../controller/chat")

router.post("/createChat",protect,createChat);
router.get("/fetchchat",protect, fetchchat);
router.get("/allChat",allChat);
router.delete("/deleteall",deleteall);

module.exports = router;