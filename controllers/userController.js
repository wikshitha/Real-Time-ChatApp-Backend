import bcrypt from "bcrypt";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cloudinary from "../cloudinary.js";

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
    const {profilePic, firstName, lastName} = req.body;

    if(req.user == null) {
        res.status(401).json({
            message : "Pleace Login First"  
        })
        return;
    }
    if(!profilePic) {
        res.status(400).json({
            message : "Profile Pic is Required"
        })
        return;
    }
    if(!firstName) {
        res.status(400).json({
            message : "First Name is Required"
        })
        return;
    }
    if(!lastName) {
        res.status(400).json({
            message : "Last Name is Required"
        })
        return;
    }

    try {
        if(req.user.email == email) {
           const uploadResponse = await cloudinary.uploader.upload(profilePic)

           const updatedUser = await User.findByIdAndUpdate(email, {
            firstName,
            lastName,
            profilePic : uploadResponse.secure_url
           }, {new : true})

           res.json(updatedUser)
        }

    } catch (error) {
     res.status(500).json({
        message : "User Updation Failed"
     })   
    }
}