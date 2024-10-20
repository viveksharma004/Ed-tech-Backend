const RatingAndReview=require("../Models/RatingAndReviews");
const Course=require("../Models/Course");
const mongoose = require("mongoose");
// const {ObjectId} = mongoose.Types;/


//create review 
exports.createRatingAndReview=async(req,res)=>{
    try{
        let userId=req.user.id;
        // userId=new mongoose.Types.ObjectId(userId);
        const {rating,review,courseId}=req.body;
        // const cId=new mongoose.Schema.Types.ObjectId(courseId);./
        //checking user is enrolled or not
        const courseDetails=await Course.findById(
            courseId,{
                match: {_id: userId}
            }
        )
        // console.log("Found the user ",courseDetails);
        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"User not enrolled in the course"
            })
        }
         
        //already reviewed
        const alreadyReviewed=await RatingAndReview.findOne({user:userId,
            course:courseId,
        });
        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"Course is already reviewed by the user"
            })
        }

        //create rating and review
        const ratingReview=await RatingAndReview.create({rating,review,course:courseId,user:userId});

        await Course.findByIdAndUpdate(courseId,{
            $push:{
                ratingAndReviews:ratingReview._id
            }
        },{new:true});

        // console.log("Updated rw",ratingReview);
        return res.status(200).json({
            success:true,
            message:"RW created successfully"
            ,ratingReview:ratingReview
        })

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Could not create rw"
        })
    }
}


//get avg rating 

exports.getAverageRating=async (req,res)=>{
    try{
        const courseId=req.body.courseId;

        //calculate the avg rating
        const result=await RatingAndReview.aggregate([{
            $match:{
                course: new mongoose.Types.ObjectId(courseId),
            },
        },
        {
            $group:{
            _id:null,
            averageRating:{$avg:"$rating"},
            }
        }
    ]);
    // console.log(result);
    if(result.length>0){
        return res.status(200).json({
            success:true,
            averageRating:result[0].averageRating
        })
    }
    return res.status(200).json({
        success:true,
        message:"Average rating is 0",
        averageRating:0,
    })

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Could not get avg rw"
        })
    }
}

//get all rating and reviews
exports.getAllRating=async (req,res)=>{
    try{
        const allReviews=await RatingAndReview.find({}).sort({rating:"desc"}).populate({
            path:"user",
            select:"firstName lastName email image"
        }).populate({
            path:"course",
            select:"courseName"
        })
        return res.status(200).json({
            success:true,
            data:allReviews,
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Could not get avg rw"
        })
    }
}

//course specific rws