
const express = require("express");
require('dotenv').config();

const cors = require("cors");
const connectDB = require("./configs/db");
const {inngest,functions} = require('./inngest/index')
const {serve} = require('inngest/express')
const { clerkMiddleware } = require('@clerk/express');
const userRoute = require('./routes/userRoutes')
const postRoute = require('./routes/postRoutes')
const storyRoute = require('./routes/storyRoutes')
const messageRoute = require("./routes/messageRoutes")
const app = express()
connectDB()

app.use(express.json())

app.use(cors());
app.use(clerkMiddleware())

//routes

app.get('/',(req,res)=>res.send("server is running"))
app.use('/api/inngesQAt',serve({client:inngest,functions}))
app.use('/api/user',userRoute)
app.use('/api/post',postRoute)
app.use('/api/story',storyRoute)
app.use('/api/message',messageRoute)
const PORT = process.env.PORT || 5000

app.listen(PORT,()=>console.log(`server is running on port ${PORT}`))

