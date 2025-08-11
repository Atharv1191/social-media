
const express = require("express");
const { upload } = require("../configs/multer");
const protect = require("../middelewers/Auth");
const { addPost, getFeedPosts, likePost } = require("../controllers/postController");

const router = express.Router();
router.post("/add", protect, upload.array('images', 4), addPost);

router.get("/feed",protect,getFeedPosts);
router.post('/like',protect,likePost)

module.exports = router
