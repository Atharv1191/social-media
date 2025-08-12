// const fs = require("fs");
// const imagekit = require("../configs/imagekit");
// const Message = require("../models/Message");

// // Store server-side connections
// const connections = {};

// // Controller function for SSE
// const sseController = async (req, res) => {
//     const { userId } = req.params;
   
//     console.log("New client connected:", userId);

//     res.setHeader("Content-Type", "text/event-stream");
//     res.setHeader("Cache-Control", "no-cache");
//     res.setHeader("Connection", "keep-alive");
//     res.setHeader("Access-Control-Allow-Origin", "*");

//     connections[userId] = res;

//     res.write("log: Connected to sse stream\n\n")
//     req.on("close",()=>{
//         delete connections[userId];
//         console.log("Clent dissconnected")
//     })
// };



// // Send message
// const sendMessage = async (req, res) => {
//     try {
//         const { userId } = req.auth();
//         const { to_user_id, text } = req.body;
//         const image = req.file;

//         let media_url = "";
//         let message_type = image ? "image" : "text";

//         if (message_type === "image") {
//             const fileBuffer = fs.readFileSync(image.path);
//             const response = await imagekit.upload({
//                 file: fileBuffer,
//                 fileName: image.originalname, // fixed typo from orignalname
//             });

//             media_url = imagekit.url({
//                 path: response.filePath,
//                 transformation: [
//                     { quality: "auto" },
//                     { format: "webp" },
//                     { width: "1280" },
//                 ],
//             });
//         }

//         const message = await Message.create({
//             from_user_id: userId,
//             to_user_id,
//             text,
//             message_type,
//             media_url,
//         });

//         // Populate sender data
//         const messageWithUserData = await Message.findById(message._id).populate("from_user_id");

//         // Send SSE update before returning response
//         if (connections[to_user_id]) {
//             connections[to_user_id].forEach(conn => {
//                 conn.write(`data: ${JSON.stringify(messageWithUserData)}\n\n`);
//             });
//         }

//         return res.json({
//             success: true,
//             message,
//         });

//     } catch (error) {
//         console.log(error);
//         return res.json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// //get chat messages
// const getChatMessages = async(req,res)=>{
//     try {
//         const {userId} = req.auth;
//         const {to_user_id} = req.body;

//         const messages = await Message.find({
//             $or:[
//                 {from_user_id:userId,to_user_id},
//                 {to_user_id:to_user_id,to_user_id:userId},
//             ]
//         }).sort({created_at:-1})
//         await Message.updateMany({from_user_id:to_user_id,to_user_id:userId},{seen:true})
//         return res.json({
//             success:true,
//             messages
//         })
        
//     } catch (error) {
//          console.log(error);
//         return res.json({
//             success: false,
//             message: error.message,
//         });
        
//     }
// }

// const getUserRecentMessages = async(req,res)=>{
//     try {
//         const {userId} = req.auth();
//         const messages = await Message.find({to_user_id:userId}.populate('from_user_id to_user_id').sort({created_at:-1}))

//         return res.json({
//             success:true,
//             messages
//         })
        
//     } catch (error) {
//          console.log(error);
//         return res.json({
//             success: false,
//             message: error.message,
//         });
        
//     }
// }

// module.exports = { sseController, sendMessage, connections,getChatMessages,getUserRecentMessages };
const fs = require("fs");
const imagekit = require("../configs/imagekit");
const Message = require("../models/Message");

// Store server-side connections
const connections = {};

// Controller function for SSE
const sseController = async (req, res) => {
  const { userId } = req.params;

  console.log("New client connected:", userId);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  connections[userId] = res;

  res.write("log: Connected to sse stream\n\n");
  req.on("close", () => {
    delete connections[userId];
    console.log("Client disconnected");
  });
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id, text } = req.body;
    const image = req.file;

    let media_url = "";
    const message_type = image ? "image" : "text";

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
      connections[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`);
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

// Get chat messages between current user and another user
const getChatMessages = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id } = req.body;

    const messages = await Message.find({
      $or: [
        { from_user_id: userId, to_user_id: to_user_id },
        { from_user_id: to_user_id, to_user_id: userId },
      ],
    }).sort({ created_at: -1 });

    // Mark messages from the other user as seen
    await Message.updateMany({ from_user_id: to_user_id, to_user_id: userId }, { seen: true });

    return res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get recent messages for current user, populated with sender and receiver info
const getUserRecentMessages = async (req, res) => {
  try {
    const { userId } = req.auth();
    const messages = await Message.find({ to_user_id: userId })
      .populate("from_user_id to_user_id")
      .sort({ created_at: -1 });

    return res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  sseController,
  sendMessage,
  connections,
  getChatMessages,
  getUserRecentMessages,
};
