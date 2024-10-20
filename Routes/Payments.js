const express=require("express");
const router=express.Router();

const {capturePayment,verifyPayment}=require("../Controllers/Payments")
const {auth,isInstructor,isStudent,isAdmin}=require("../Middlewares/auth");
const {sendPaymentSuccessEmail}=require("../Controllers/Payments");

router.post("/capturePayment",auth,isStudent,capturePayment);
router.post("/verifyPayment",auth,isStudent,verifyPayment);
router.post("/sendPaymentSuccessEmail",auth,isStudent,sendPaymentSuccessEmail)

module.exports=router;