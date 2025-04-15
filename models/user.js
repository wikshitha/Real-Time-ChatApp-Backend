import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    profilePic : {
        type : String,
        required : true,
        default : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    }
})

const User = mongoose.model("User", userSchema);

export default User;