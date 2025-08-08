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
                  _id: user._id.toString(),
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

export async function updateUser(req, res) {
    const { profilePic } = req.body;
    const email = req.user?.email;
  
    if (!req.user) {
      return res.status(401).json({ message: "Please login first" });
    }
  
    if (!profilePic) {
      return res.status(400).json({ message: "Profile Pic is required" });
    }
  
    try {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
  
      // ✅ only update profilePic, do not overwrite other fields
      await User.updateOne(
        { email },
        { $set: { profilePic: uploadResponse.secure_url } }
      );
  
      // ✅ fetch full user again
      const updatedUser = await User.findOne({ email });
  
      res.json({
        message: "User Updated Successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update failed:", error);
      res.status(500).json({ message: "User update failed" });
    }
  }
  

  export async function checkAuth(req, res) {
    try {
      const email = req.user?.email;
      if (!email) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      // ✅ Fetch full, up-to-date user data from DB
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({ user }); // ✅ Now frontend gets correct profilePic too
    } catch (err) {
      console.log("Error in checkAuth:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  