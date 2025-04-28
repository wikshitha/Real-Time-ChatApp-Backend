import express from "express";
import { checkAuth, loginUser, registerUser, updateUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register",registerUser)

userRouter.post("/login",loginUser)

userRouter.put("/:email",updateUser)

userRouter.get("/check",checkAuth)

export default userRouter