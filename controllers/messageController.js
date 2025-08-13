import cloudinary from "../cloudinary.js";
import { getReciverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.js";
import User from "../models/user.js"

export async function getUsersForSide (req,res) {

    if(req.user == null) {
        res.status(401).json({message : "Pleace Login First"})
        return;
    }

    try {
        const loggedUserID = req.user.email
        const filteredUsers = await User.find({email : {$ne : loggedUserID}}).select("-password")

        res.json(filteredUsers)

    } catch (error) {
        res.status(500).json({message : "Error Fetching Users"})
    }
}

export async function getMessages(req,res) {
    if(req.user == null) {
        res.status(401).json({message : "Pleace Login First"})
        return;
    }
    try {

        const { id:userToChatId} = req.params;
        const myId = req.user._id

        const messages = await Message.find({
            $or : [
                {senderID : myId, receiverID : userToChatId},
                {senderID : userToChatId, receiverID : myId}
            ]
        })

        res.json(messages)
    } catch (error) {
        res.status(500).json({message : "Error Fetching Messages"})
    }
}

export async function sendMessage(req,res) {
    if(req.user == null) {
        res.status(401).json({message : "Pleace Login First"})
        return;
    }

    try {
        const { text, image } = req.body;
        const { id: receiverID } = req.params; // ✅ match schema exactly
        const senderID = req.user._id; 

        let imageURL;

        if(image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageURL = uploadResponse.secure_url
        }
               // ✅ match schema exactly
        
        const newMessage = new Message({
          senderID,
          receiverID,
          text,
          image: imageURL
        });
        

        await newMessage.save();


        const reciverSocketId = getReciverSocketId(receiverID)
        if(reciverSocketId) {
            io.to(reciverSocketId).emit("newMessage", newMessage)
        }

        res.json(newMessage)
    } catch (error) {
        console.log(error);
        res.status(500).json({message : "Error Sending Message"})
    }
}