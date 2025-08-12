
const express = require("express");
const { sseController, sendMessage, getChatMessages } = require("../controllers/messageController");
const { upload } = require("../configs/multer");
const protect = require("../middelewers/Auth");

const router = express.Router();

router.get("/:id",protect, sseController);

router.post('/send',upload.single("image"),protect,sendMessage);
router.post('/get',protect,getChatMessages)

module.exports = router;