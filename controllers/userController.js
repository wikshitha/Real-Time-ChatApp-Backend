import bcrypt from "bcrypt";
import User from "../models/user.js";

export function registerUser(req,res) {
    const data = req.body;

    data.password = bcrypt.hashSync(data.password, 10);

    const newUser = new User(data);
    newUser.save().then(()=>{
        res.json({
            message : "User Registered Successfully"
        })
    }).catch(()=>{
        res.status(500).json({
            message : "User Registration Failed"
        })
    })
}