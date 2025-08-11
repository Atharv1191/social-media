
const express = require("express");
require('dotenv').config();

const cors = require("cors");
const connectDB = require("./configs/db");
const {inngest,functions} = require('./inngest/index')
const {serve} = require('inngest/express')
const { clerkMiddleware } = require('@clerk/express');
const userRoute = require('./routes/userRoutes')



const app = express()
connectDB()

app.use(express.json())

app.use(cors());
app.use(clerkMiddleware())

//routes

app.get('/',(req,res)=>res.send("server is running"))
app.use('/api/inngest',serve({client:inngest,functions}))
app.use('/api/user',userRoute)
const PORT = process.env.PORT || 5000

app.listen(PORT,()=>console.log(`server is running on port ${PORT}`))

