const express = require("express");
const router= express.Router();

const {updateProfile,deleteProfile,getUserDetails,updateDisplayPicture,instructorDashboard,getEnrolledCourses}=require("../Controllers/Profile");
const {auth,isInstructor}=require("../Middlewares/auth");


router.put("/updateProfile",auth,updateProfile);
router.delete("/auth/deleteProfile",auth,deleteProfile);
router.get("/getUserDetails",auth,getUserDetails);
router.put("/updateDisplayPicture",auth,updateDisplayPicture);
router.get("/instructorDashboard",auth,isInstructor,instructorDashboard);
router.get("/getEnrolledCourses",auth,getEnrolledCourses);

// router.get("/getInstructorCourses",getInstructorCourses);TODO: Need to figure out 

module.exports=router;