import bcrypt from "bcrypt";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config()

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

export function loginUser(req,res) {
    const data = req.body;

    User.findOne({
        email : data.email
    }).then((user)=>{
        if(user == null) {
            res.status(404).json({
                message : "User Not Found"
            })
        }else {
            const isPasswordCorrect = bcrypt.compareSync(data.password, user.password);
            if(isPasswordCorrect) {
                const token = jwt.sign({
                    email : user.email,
                    firstName : user.firstName,
                    lastNamme : user.lastName,
                    profilePic : user.profilePic
                },process.env.JWT_SECRET)
                
                res.json({
                    message : "User Logged In Successfully",
                    token : token
                })
            }else {
                res.status(401).json({
                    message : "Incorrect Password"
                })
            }
        }
    })
}

export async function updateUser(req,res) {
    const email = req.params.email;
    const data = req.body;

    if(req.user == null) {
        res.status(401).json({
            message : "Pleace Login First"  
        })
        return;
    }
    try {
        if(req.user.email == email) {
            await User.updateOne({
                email : email
            }, data)

            res.json({
                message : "User Updated Successfully"
            })
        } else {
            res.status(401).json({
                message : "Unauthorized Access"
            })
        }

    } catch (error) {
     res.status(500).json({
        message : "User Updation Failed"
     })   
    }
}