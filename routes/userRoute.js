import express from "express";
import { loginUser, registerUser, updateUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register",registerUser)

userRouter.post("/login",loginUser)

userRouter.put("/:email",updateUser)

export default userRouter