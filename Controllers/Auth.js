const User = require("../Models/User");
const OTP = require("../Models/OTP");
const otpGenerator=require("otp-generator")
const bcrypt=require("bcrypt");
const Profile = require("../Models/Profile");
const jwt=require("jsonwebtoken");
const mailSender = require("../Utils/mailSender");
require("dotenv").config();

function OTPGenerator() {
    return otp=otpGenerator.generate(6,{
        upperCaseAlphabets: false,
        lowerCaseAlphabets:false,
        specialChars:false,
    });
}

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const checkUserPresent = await User.findOne({ email });

    if (checkUserPresent) {
      return res.status(403).json({
        message: "User already Exists",
      });
    }

    var otp=OTPGenerator();
    console.log("OTP Generated",otp);

    // check uniqueness of the otp
    let result=await OTP.findOne({otp:otp});

    while(result){
        otp = OTPGenerator();
        result=await OTP.findOne({otp:otp});
    }

    //creating object of the otp
    const payload={
        otp:otp, 
        email:email,
    }

    const otpBody=await OTP.create({email:email,otp:otp});
    // console.log("Otp Created to DB",otpBody);

    res.status(200).json({
        success:true,
        message: "OTP Sent Successfully", 
        otp,
    })

  } catch (e) {
    console.log(e)
    res.status(500).json({
        success:false,
        message: "Could not Send OTP,Try Again",
    })
  }
};

exports.signUp=async (req, res) => {
    try {
        //data fetch
        const {firstName,lastName,email,password
            ,confirmPassword,accountType,contactNumber,otp}=req.body;

        //validate data
        if( !firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success:false,
                message:"All fields are required !!!"
            })
        }
        //password matching 2 pass
        if(password!==confirmPassword) {
            return res.status(400).json({
                success:false,
                message:"password and confirm password does not match"
            })
        }
        //check user already exist or not
        const existedUser=await User.findOne({email});
        if(existedUser){
            return res.status(400).json({
                success:false,
                message:"User is already registered"
            })
        }

        //find most recent otp stored in the db
        const recentOTP=await OTP.findOne({email}).sort({createdAt:-1}).limit(1);
        // console.log("Recent OTP :", recentOTP)
        //validate otp 
        if(recentOTP.length==0){
            return res.status(400).json({
                success:false,
                message:"OTP Could not Found"
            })
        }else if(otp!==recentOTP.otp){
            return res.status(400).json({
                success:false,
                message:"Invalid OTP"
            })
        }

        //hash password 
        const hashedPassword=await bcrypt.hash(password,10);
        
        //created entry in db
        const profileDetails=await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        })
        const user=await User.create({
            firstName,lastName,
            email,
            contactNumber,
            password:hashedPassword,
            contactNumber,
            accountType,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        return res.status(200).json({
            success:true,
            message:"User is registered successfully",
            user,
        })
    }catch(e){
        return res.status(500).json({
            console:e.message,
            success:false,
            message: "Could not SignUp",
        })
    }
};


//login 

exports.Login=async (req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are required!!!"
            })
        }
        const user=await User.findOne({email}).populate("additionalDetails")
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User not registered with us"
            })
        }
        if(await bcrypt.compare(password,user.password)){
            const payload={
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token=jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"24h",
            })
            user.token=token;
            user.password=undefined;

            const options={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"User logged In successfully"
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message: "Password is not correct",
            })
        }

    }
    catch(err){
        return res.status(500).json({
            success:false,
            console:err.message,
            message: "Could not Login",
        })
    }
}


// change password
exports.changePassword=async (req,res)=>{
    try{
        //get data from body
    //get old password ,new one confirm password
    const {oldPassword,password}=req.body;
    // console.log(oldPassword,password,confirmPassword);
    //validation
    if(!oldPassword || !password ){
        return res.status(401).json({
            success:false,
            message:"All fields are required",
        })
    } 
    //update password
    const email=req.user.email;
    const userData=await User.findOne({email:email});
    const match = await bcrypt.compare(oldPassword, userData.password);
    // console.log("value of match::",match);
    if(match){
        const email=req.user.email;
        const hashedPassword=await bcrypt.hash(password,10);
        userData.password=hashedPassword;
        await userData.save();
        //send mail

        mailSender(email,"Password Updated",
            `Password updated successfully for user ${userData.firstName} ${userData.lastName}`);
        
            //return response
            return res.status(200).json({
                success:true,
                message:`Password updated successfully for user ${userData.firstName} ${userData.lastName}`
            })
    }
    else{
        return res.status(300).json({
            success:false,
            message:"Old Password Incorrect"
        })
    }
    
    }catch(err){
        return res.status(200).json({
            success:false,
            error:err.message,
            message:`Password not updated `
        })
    }
}