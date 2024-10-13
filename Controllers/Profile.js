const Profile=require("../Models/Profile")
const User=require("../Models/User");
const {uploadImageToCloudinary}=require("../Utils/imageUploader")
const {convertSecondsToDuration}=require("../Utils/secToDuration")
const CourseProgress=require("../Models/CourseProgress")
const Course =require("../Models/Course");
const mailSender = require("../Utils/mailSender");
const { contactUsEmail } = require("../mail/templates/contactFormRes");


exports.updateProfile=async (req,res)=>{
    try{
        const {dateOfBirth="",about="",contactNumber,gender}=req.body;
        const userId=req.user.id;
        // console.log(userId);
        if(!contactNumber || !gender){
            return res.status(400).json({
                success:false,
                message:"Contact Number and gender are required"
            })
        }
        //find user
        let userDetails=await User.findById(userId);
        const profileId=userDetails.additionalDetails;
        // console.log("Profile Id::",profileId);
        const profileDetails=await Profile.findById(profileId);

        //updating the profile
        profileDetails.about=about;
        profileDetails.contactNumber=contactNumber;
        profileDetails.gender=gender;
        profileDetails.dateOfBirth=dateOfBirth;
        await profileDetails.save();
        userDetails=await User.findById(userId).populate("additionalDetails").exec();
        if(userDetails.password){
          userDetails.password=null;
        }

        return res.status(200).json({
            success:true,
            message:"Updated the profile of the user",
            profileDetails:profileDetails,
            user:userDetails,
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Could not update the profile Information",
            error:err.message
        })
    }
}


//delete account 
//scheduling the delete request
//cron job
exports.deleteProfile=async(req,res)=>{
    try{
        const userId=req.user.id;
        if(!userId){
            return res.status(500).json({
                success:false,
                message:"Could not delete the account"
            })
        }
        const userDetails=await User.findById(userId);
        if(!userDetails){
            return res.status(500).json({
                success:false,
                message:"User not found"
            })
        }

        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        //unenroll the user from all the enrolled courses

        await User.findByIdAndDelete({_id:userId});
        return res.status(200).json({
            success:true,
            message:"User Account deleted successfully"
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Could not delete the user account",
            error:err.message
        })
    }
}

//get all user details
exports.getUserDetails=async(req,res)=>{
    try{
        const id=req.user.id;
        const userDetails=await User.findById(id).populate("additionalDetails").exec();
        userDetails.password=null;
        userDetails.token=null;
        return res.status(200).json({
            success:true,
            message:"User Details fetched successfully",
            data:userDetails,
        })

    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Could not fetch all  user details",
            error:err.message
        })
    }
}

exports.updateDisplayPicture=async (req,res)=>{
    try{
        const userId=req.user.id;
        // console.log("User Id :: ",userId);

        const imageFile=req.files.displayPicture;
        // console.log("Image file",imageFile);

        const imageResponse=await uploadImageToCloudinary(imageFile,"vivek");
        // console.log("Image cloudinary response",imageResponse);
        const userDetails=await User.findByIdAndUpdate(userId,{
          image:imageResponse.secure_url,
        },{new:true}).populate("additionalDetails").exec();
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User not found",
                
            })
        }
        // userDetails.image=imageResponse.secure_url;
        // await userDetails.save();
        // console.log(userDetails);
        return res.status(200).json({
            success:true,
            message:"Image uploaded successfully",
            data:userDetails
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Internal server error during image upload"
        })
    }
}



//instructor dashboard

exports.instructorDashboard = async (req, res) => {
    try {
      const courseDetails = await Course.find({ instructor: req.user.id })
  
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course.studentsEnrolled.length
        const totalAmountGenerated = totalStudentsEnrolled * course.price
  
        // Create a new object with the additional fields
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          // Include other course properties as needed
          totalStudentsEnrolled,
          totalAmountGenerated,
        }
  
        return courseDataWithStats
      })
  
      res.status(200).json({ courses: courseData })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server Error" })
    }
  }



//get enrolled courses

exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      // console.log(userId);
      let userDetails = await User.findOne({
        _id: userId,
      })
        .populate({
          path: "courses",
          populate: {
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          },
        })
        .exec()
        // console.log("User details",userDetails);
      userDetails = userDetails.toObject()
      var SubsectionLength = 0
      for (var i = 0; i < userDetails.courses.length; i++) {
        let totalDurationInSeconds = 0
        SubsectionLength = 0
        for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
          totalDurationInSeconds += userDetails.courses[i].courseContent[
            j
          ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
          userDetails.courses[i].totalDuration = convertSecondsToDuration(
            totalDurationInSeconds
          )
          SubsectionLength +=
            userDetails.courses[i].courseContent[j].subSection.length
        }
        let courseProgressCount
        if(userDetails.courses[i]._id){
        courseProgressCount = await CourseProgress.findOne({
          courseId: userDetails.courses[i]._id,
          userId: userId,
        })
        }
        courseProgressCount = courseProgressCount?.completedVideos.length
        if (SubsectionLength === 0) {
          userDetails.courses[i].progressPercentage = 100
        } else {
          // To make it up to 2 decimal point
          const multiplier = Math.pow(10, 2)
          userDetails.courses[i].progressPercentage =
            Math.round(
              (courseProgressCount / SubsectionLength) * 100 * multiplier
            ) / multiplier
        }
      }
  
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }


  exports.contactUs=async (req,res)=>{
    try{
      const {countrycode,
        email,
        firstname,
        lastname,
        message,
        phoneNo,}=req.body;
        const bodyData=contactUsEmail(firstname ,lastname,phoneNo,message,countrycode,email);
        const response=await mailSender(email,"Thank You for Contacting Us from StudyNotion",bodyData);
        console.log("email response ",response);
        return res.status(200).json({
          success:true,
          message:"Mail sent successfully..."
        })
    }catch(err){
      console.log(err)
      return res.status(500).json({
        success: false,
        data:"Internal server error"
      })
    }
  }