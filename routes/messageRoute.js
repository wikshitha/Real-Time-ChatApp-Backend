import express from "express";
import { getMessages, getUsersForSide, sendMessage } from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users",getUsersForSide)
messageRouter.get("/:id",getMessages)
messageRouter.post("/send/:id",sendMessage)

export default messageRouter