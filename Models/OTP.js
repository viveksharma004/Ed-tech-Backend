const mongoose=require("mongoose");
const mailSender = require("../Utils/mailSender");

const OTPSchema= new mongoose.Schema({
    email:{
        type:String,
        required: true,
    },
    otp:{
        type:String,
        required:true,
    }
    ,
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60,
    }
})

//function to send email
async function sendVerificationEmail(email,otp){
    try{
        const mailResponse=await mailSender(email,"Verification Email from StudyNotion",otp);
        console.log("Email Sent Successfully :",mailResponse)
    }
    catch(e){
        console.log("Error while sending mail :",e);
        throw e;
    }
}

// middleware pre method of the model
OTPSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})

module.exports=mongoose.model("OTP",OTPSchema);