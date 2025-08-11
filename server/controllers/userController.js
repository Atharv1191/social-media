const fs = require("fs");
const imagekit = require("../configs/imagekit");
const User = require("../models/User");
const Connection = require("../models/Connection");

// GET USER DATA
const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE USER DATA
const updateData = async (req, res) => {
  try {
    const { userId } = req.auth();
    let { username, bio, location, full_name } = req.body;

    const tempUser = await User.findById(userId);
    if (!tempUser) {
      return res.json({ success: false, message: "User not found" });
    }

    // Update username only if changed and not taken
    let updatedUsername = username || tempUser.username;
    if (tempUser.username !== updatedUsername) {
      const existingUser = await User.findOne({ username: updatedUsername });
      if (existingUser) {
        updatedUsername = tempUser.username;
      }
    }

    const updatedData = {
      username: updatedUsername,
      bio,
      location,
      full_name,
    };

    const profile = req.files?.profile?.[0];
    const cover = req.files?.cover?.[0];

    if (profile) {
      const buffer = fs.readFileSync(profile.path);
      const response = await imagekit.upload({
        file: buffer,
     fileName: profile.originalname,
      });
      const url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "512" },
        ],
      });
      updatedData.profile_picture = url;
    }

    if (cover) {
      const buffer = fs.readFileSync(cover.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: cover.originalname,
      });
      const url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });
      updatedData.cover_photo = url;
    }

    const user = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    return res.json({
      success: true,
      user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// DISCOVER USERS
const discoverUsers = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { input } = req.body;

    const allUsers = await User.find({
      $or: [
        { username: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
      ],
    });

    const filteredUsers = allUsers.filter(
      (user) => user._id.toString() !== userId
    );

    return res.json({
      success: true,
      users: filteredUsers,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// FOLLOW USER
const followUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id: targetId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.following.includes(targetId)) {
      return res.json({
        success: false,
        message: "You are already following this user",
      });
    }

    user.following.push(targetId);
    await user.save();

    const toUser = await User.findById(targetId);
    if (!toUser) return res.json({ success: false, message: "Target user not found" });

    toUser.followers.push(userId);
    await toUser.save();

    return res.json({
      success: true,
      message: "You are now following this user",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// UNFOLLOW USER
const UnFollowUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id: targetId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    user.following = user.following.filter(
      (id) => id.toString() !== targetId
    );
    await user.save();

    const toUser = await User.findById(targetId);
    if (!toUser) return res.json({ success: false, message: "Target user not found" });

    toUser.followers = toUser.followers.filter(
      (id) => id.toString() !== userId
    );
    await toUser.save();

    return res.json({
      success: true,
      message: "You are no longer following this user",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
// Send Connection Request
const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id: targetUserId } = req.body;

    // Prevent sending request to yourself
    if (userId === targetUserId) {
      return res.json({
        success: false,
        message: "You cannot send a connection request to yourself"
      });
    }

    // Check if user has sent more than 20 requests in the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRequests = await Connection.find({
      from_user_id: userId,
      created_at: { $gt: last24Hours }
    });

    if (recentRequests.length >= 20) {
      return res.json({
        success: false,
        message: "You have sent more than 20 connection requests in the last 24 hours"
      });
    }

    // Check if a connection already exists in either direction
    const existingConnection = await Connection.findOne({
      $or: [
        { from_user_id: userId, to_user_id: targetUserId },
        { from_user_id: targetUserId, to_user_id: userId }
      ]
    });

    if (!existingConnection) {
      await Connection.create({
        from_user_id: userId,
        to_user_id: targetUserId,
        status: "pending"
      });

      return res.json({
        success: true,
        message: "Connection request sent successfully"
      });
    }

    if (existingConnection.status === "accepted") {
      return res.json({
        success: false,
        message: "You are already connected with this user"
      });
    }

    if (existingConnection.status === "pending") {
      return res.json({
        success: false,
        message: "A pending connection request already exists"
      });
    }

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get User Connections
const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId)
      .populate("connections")
      .populate("followers")
      .populate("following");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const pendingRequests = await Connection.find({
      to_user_id: userId,
      status: "pending"
    }).populate("from_user_id");

    const pendingConnections = pendingRequests.map(req => req.from_user_id);

    return res.json({
      success: true,
      connections: user.connections,
      followers: user.followers,
      following: user.following,
      pendingConnections
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Accept Connection Request
const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id: requesterId } = req.body;

    const connectionDoc = await Connection.findOne({
      from_user_id: requesterId,
      to_user_id: userId
    });

    if (!connectionDoc) {
      return res.json({
        success: false,
        message: "Connection not found"
      });
    }

    // Update both users' connections if not already added
    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user.connections.includes(requesterId)) {
      user.connections.push(requesterId);
    }

    if (!requester.connections.includes(userId)) {
      requester.connections.push(userId);
    }

    await user.save();
    await requester.save();

    // Update connection status
    connectionDoc.status = "accepted";
    await connectionDoc.save();

    return res.json({
      success: true,
      message: "Connection accepted successfully"
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};



module.exports = {
  getUserData,
  updateData,
  discoverUsers,
  followUser,
  UnFollowUser,
  sendConnectionRequest,
  getUserConnections,
  acceptConnectionRequest
};
