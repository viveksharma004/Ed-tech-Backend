const express=require("express");
const router=express.Router();

const {Login,
    signUp,sendOTP,changePassword}=require("../Controllers/Auth");

const {
    resetPasswordToken,resetPassword
}=require("../Controllers/ResetPassword");

const {auth}=require("../Middlewares/auth");
const { contactUs } = require("../Controllers/Profile");

//Routes for Login,signup, and authentication

router.post("/login",Login);
router.post("/signup",signUp);
router.post("/sendotp",sendOTP);
router.put("/changePassword",auth,changePassword);

//resetting password
router.post("/reset-password-token",resetPasswordToken);
router.post("/reset-password",resetPassword);

router.post("/reach/contact",contactUs);

module.exports = router;