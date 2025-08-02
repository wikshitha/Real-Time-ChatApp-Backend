import bodyParser from "body-parser";
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRouter from "./routes/userRoute.js";
import jwt from "jsonwebtoken";
import messageRouter from "./routes/messageRoute.js";
import cors from "cors";


dotenv.config();

const app = express();

app.use(cors());

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use((req,res,next)=>{
    let token = req.header
    ("Authorization");

    if(token !=null){
        token = token.replace("Bearer ","");

        jwt.verify(token,process.env.JWT_SECRET,
            (err,decoded)=>{
                if(!err){
                    req.user = decoded;
            }
        }
        )
    }
    next();
})

let mongoUrl = process.env.MONGO_URL;

mongoose.connect(mongoUrl)

let connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB database connection established successfully");
})


app.use("/api/users",userRouter)
app.use("/api/messages",messageRouter)

app.listen(3000, () => {
    console.log("Server is running on port 3000")
});