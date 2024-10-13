const express=require("express");
const router=express.Router();

const {capturePayment,verifyPayment}=require("../Controllers/Payments")
const {auth,isInstructor,isStudent,isAdmin}=require("../Middlewares/auth");

router.post("/capturePayment",auth,isStudent,capturePayment);
router.post("/verifySignature",auth,isStudent,verifyPayment);

module.exports=router;