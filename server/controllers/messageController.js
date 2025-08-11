const fs = require("fs");
const imagekit = require("../configs/imagekit");
const Message = require("../models/Message");

// Store server-side connections
const connections = {};

// Controller function for SSE
const sseController = async (req, res) => {
    const { userId } = req.params;
    console.log("New client connected:", userId);

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Store the connection
    if (!connections[userId]) {
        connections[userId] = [];
    }
    connections[userId].push(res);

    // Initial message
    res.write(`data: Connected to SSE stream for user ${userId}\n\n`);

    // On disconnect
    req.on("close", () => {
        connections[userId] = connections[userId].filter(conn => conn !== res);
        if (connections[userId].length === 0) {
            delete connections[userId];
        }
        console.log("Client disconnected:", userId);
    });
};

// Send message
const sendMessage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { to_user_id, text } = req.body;
        const image = req.file;

        let media_url = "";
        let message_type = image ? "image" : "text";

        if (message_type === "image") {
            const fileBuffer = fs.readFileSync(image.path);
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: image.originalname, // fixed typo from orignalname
            });

            media_url = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: "auto" },
                    { format: "webp" },
                    { width: "1280" },
                ],
            });
        }

        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url,
        });

        // Populate sender data
        const messageWithUserData = await Message.findById(message._id).populate("from_user_id");

        // Send SSE update before returning response
        if (connections[to_user_id]) {
            connections[to_user_id].forEach(conn => {
                conn.write(`data: ${JSON.stringify(messageWithUserData)}\n\n`);
            });
        }

        return res.json({
            success: true,
            message,
        });

    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: error.message,
        });
    }
};

//get chat messages
const getChatMessages = async(req,res)=>{
    try {
        const {userId} = req.auth;
        const {to_user_id} = req.body;

        const messages = await Message.find({
            $or:[
                {from_user_id:userId,to_user_id},
                {to_user_id:to_user_id,to_user_id:userId},
            ]
        }).sort({created_at:-1})
        await Message.updateMany({from_user_id:to_user_id,to_user_id:userId},{seen:true})
        return res.json({
            success:true,
            messages
        })
        
    } catch (error) {
         console.log(error);
        return res.json({
            success: false,
            message: error.message,
        });
        
    }
}

const getUserRecentMessages = async(req,res)=>{
    try {
        const {userId} = req.auth();
        const messages = await Message.find({to_user_id:userId}.populate('from_user_id to_user_id').sort({created_at:-1}))

        return res.json({
            success:true,
            messages
        })
        
    } catch (error) {
         console.log(error);
        return res.json({
            success: false,
            message: error.message,
        });
        
    }
}

module.exports = { sseController, sendMessage, connections,getChatMessages,getUserRecentMessages };
