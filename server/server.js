
const express = require("express");
const cors = require("cors");
const connectDB = require("./configs/db");
const {inngest,functions} = require('./inngest/index')
const {serve} = require('inngest/express')
require('dotenv').config();

const app = express()
connectDB()

app.use(express.json())

app.use(cors());

//routes

app.get('/',(req,res)=>res.send("server is running"))
app.use('/api/inngest',serve({client:inngest,functions}))
const PORT = process.env.PORT || 5000

app.listen(PORT,()=>console.log(`server is running on port ${PORT}`))

