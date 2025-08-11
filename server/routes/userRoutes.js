
const express = require("express");
const protect = require("../middelewers/Auth");
const { updateData, followUser, UnFollowUser, getUserData, discoverUsers, sendConnectionRequest, acceptConnectionRequest, getUserConnections, getUserProfiles } = require("../controllers/userController");
const { upload } = require("../configs/multer");
const { getUserRecentMessages } = require("../controllers/messageController");

const router = express.Router()


router.get('/data',protect,getUserData);
router.post('/update', upload.fields([{name:"profile",maxCount:1},{name:"cover",maxCount:1}]), protect,updateData);
router.post('/discover',protect,discoverUsers);
router.post('/follow',protect,followUser);
router.post('/unfollow',protect,UnFollowUser);
router.post('/connect',protect,sendConnectionRequest);
router.post('/accept',protect,acceptConnectionRequest);
router.get('/connections',protect,getUserConnections)
router.post('/profiles',protect,getUserProfiles)
router.get('/recent-messages',protect,getUserRecentMessages)
module.exports = router
