const jwt=require("jsonwebtoken");
require("dotenv").config();
// const User=require("../Models/User"); 

//auth 
exports.auth=async(req,res,next)=>{
    try{
        //extract token
        const token=req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ","")
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token is missing",
            })
        }
        const {courseId}=req.body;
        //if(courseId){
         //   console.log("courseId from auth", courseId);
        //}
        //verify token
        try{
            // console.log("Token",token);
            const decode=jwt.verify(token,process.env.JWT_SECRET);
            // console.log(decode);
            req.user=decode;
        }catch(err){
            return res.status(401).json({
                success:false,
                error:err.message,
                message:"Token is invalid",
            })
        }
        next();
        
    }catch(e){
        return res.status(401).json({
            success:false,
            message:"Something went wrong while validating token"
        })
    }
}

// isStudent
exports.isStudent=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Student"){
            return res.status(500).json({
                success:false,
                message:"Not Student This route is protected from "
            })
        }
        next();
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"User role not verified, try again "
        })
    }
}

//isInstructor
exports.isInstructor=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Instructor"){
            return res.status(500).json({
                success:false,
                message:"Not Instructor This route is protected"
            })
        }
        next();
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"User role not verified, try again "
        })
    }
}

//isAdmin
exports.isAdmin=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Admin"){
            return res.status(500).json({
                success:false,
                message:"Not Admin This route is protected"
            })
        }
        next();
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"User role not verified, try again "
        })
    }
}
