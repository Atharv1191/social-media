
const express = require("express");
const { upload } = require("../configs/multer");
const protect = require("../middelewers/Auth");
const { addUserStroy, getStories } = require("../controllers/storyController");

const router = express.Router();

router.post('/create',upload.single('media'),protect,addUserStroy)
router.get('/get',protect,getStories)

module.exports = router;