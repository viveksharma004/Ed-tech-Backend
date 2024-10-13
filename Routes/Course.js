const express=require("express");
const router=express.Router();



const {
    createCourse,showAllCourses,
    getCourseDetails,deleteCourse,editCourse,
    getInstructorCourses,getFullCourseDetails
}=require("../Controllers/Course");


const {showAllCategory,categoryPageDetails,
    createCategory}=require("../Controllers/Category");


const {createRatingAndReview,getAverageRating,
    getAllRating}=require("../Controllers/RatingAndReviews");


const {createSection,updateSection,
    deleteSection,getAllSection}=require("../Controllers/Section");


const {createSubSection,updateSubSection,
    deleteSubSection,getSubSectionDetails}=require("../Controllers/SubSection");


const {auth,isInstructor,isStudent,
    isAdmin}=require("../Middlewares/auth");


const {updateCourseProgress}=require("../Controllers/CourseProgress")


//course creation
router.post("/createCourse",auth,isInstructor,createCourse);
router.post("/addSection",auth,isInstructor,createSection);
router.post("/addSubSection",auth,isInstructor,createSubSection);




//course update
router.put("/updateSection",auth,isInstructor,updateSection);
router.put("/updateSubSection",auth,isInstructor,updateSubSection);
router.put("/editCourse",editCourse) 



//course delete
router.delete("/deleteCourse",auth,isInstructor,deleteCourse);
router.delete("/deleteSection",auth,isInstructor,deleteSection);
router.delete("/deleteSubSection",auth,isInstructor,deleteSubSection);




//get course details
router.get("/getAllCourses",showAllCourses);
router.post("/getCourseDetails",getCourseDetails);
router.get("/getAllSection",getAllSection);
router.get("/getSubSectionDetails",getSubSectionDetails);
router.post("/getFullCourseDetails",auth,getFullCourseDetails)

router.get("/getInstructorCourses",auth,isInstructor,getInstructorCourses)



//category routes
router.get("/showAllCategories",showAllCategory);
// router.get("/getCategoryPageDetails",categoryPageDetails);

router.post("/getCategoryPageDetails",categoryPageDetails)


//create rating and reviews
router.post("/createRating",auth,isStudent,createRatingAndReview);
router.get("/getAverageRating",getAverageRating);
router.get("/getReviews",getAllRating);




//create category
router.post("/auth/isAdmin/createCategory",auth,isAdmin,createCategory);


//course progress details
router.post("/updateCourseProgress",auth,isStudent,updateCourseProgress);
// router.get("/getProgressPercentage",getProgressPercentage);
module.exports = router;