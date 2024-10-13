const mongoose=require("mongoose");


const UserSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required: true,
        trim:true,
    },
    lastName:{
        type:String,
        required: true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    accountType:{
        type:String,
        enum:["Admin","Student","Instructor"],
        required: true,
    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile",
    },
    courses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    }],
    image:{
        type:String,
    },
    courseProgress:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"CourseProgress",
    }],
    token:{
        type:String,
    },
    resetPasswordExpires:{
        type:Date,
    }
    //this token is for the forgot password token used to validate the resetting of the password
})

module.exports=mongoose.model("User",UserSchema);