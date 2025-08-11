const fs = require('fs');
const imagekit = require('../configs/imagekit');
const Post = require('../models/Post');
const User = require('../models/User');

//Add post

const addPost = async(req,res)=>{
    try {
        const {userId} = req.auth();
        const {content,post_type} = req.body;

        const images = req.files;

        let image_urls = []
        if(images.length){
            image_urls = await Promise.all(images.map(async(image)=>{
                const fileBuffer = fs.readFileSync(image.path)
                const response = await imagekit.upload({
                    file:fileBuffer,
                 fileName: image.originalname,
                    folder:"posts"
                })

                const url = imagekit.url({
                    path:response.filePath,
                    transformation:[
                        {quality:"auto"},
                        {format:"webp"},
                        {width:"1280"}
                    ]
                })
                return url;

            }))
        }
        await Post.create({
            user:userId,
            content,
            image_urls,
            post_type
        })
        return res.json({
            success:true,
            message:"Post created successfully"
        })
    } catch (error) {
        console.log(error)
        return res.json({
            success:false,
            message:error.message
        })
        
    }

}

//get Posts

const getFeedPosts = async(req,res)=>{
    try {
        const {userId} = req.auth();
        const user = await User.findById(userId);

        //user connection and following
        const userIds = [userId, ...user.connections,...user.following ]
        const posts = await Post.find({user:{$in:userIds}}).populate("user").sort({createdAt:-1})
        return res.json({success:true,posts})
    } catch (error) {
         console.log(error)
        return res.json({
            success:false,
            message:error.message
        })
        
    }
}


//like post
const likePost = async(req,res)=>{
    try {
        const {userId} = req.auth();
        const {postId} = req.body;

        const post  = await Post.findById(postId)
        if(post.likes_count.includes(userId)){
            post.likes_count = post.likes_count.filter(user=>user !==userId)
            await Post.save()
            return res.json({
                success:true,
                messgae:"Post unliked"
            })
        }else{
            post.likes_count.push(userId)
            await post.save()
        }
         return res.json({
                success:true,
                messgae:"Post liked"
            })
        
    } catch (error) {
         console.log(error)
         return res.json({
            success:false,
            message:error.message
        }) 
    }
}
module.exports = {addPost,getFeedPosts,likePost}