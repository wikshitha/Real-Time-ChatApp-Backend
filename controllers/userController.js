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
                    lastName : user.lastName,
                    profilePic : user.profilePic
                },process.env.JWT_SECRET)
                
                res.json({
                    message : "User Logged In Successfully",
                    token : token,
                    user : user   
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
    const {profilePic} = req.body;

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
    try {
    
           const uploadResponse = await cloudinary.uploader.upload(profilePic)

           const updatedUser = await User.findByIdAndUpdate(req.user._id, {
            profilePic : uploadResponse.secure_url
           }, {new : true})

           res.json ({
            message : "User Updated Successfully",
            user : updatedUser
           }
           )
        

    } catch (error) {
        console.error("update error", error)
     res.status(500).json({
       message : "Error Updating User"
     })   
    }
}

export function checkAuth(req,res) {
    try{
        res.json({ user: req.user });
    }catch(err) {
        console.log(err)
        res.status(500).json({
            message : "User Not Found"
        })
    }
}