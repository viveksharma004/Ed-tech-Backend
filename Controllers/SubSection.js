const Section=require("../Models/Section")
const SubSection=require("../Models/SubSection");
const { uploadImageToCloudinary } = require("../Utils/imageUploader");
const Course = require("../Models/Course");

//create subsection
exports.createSubSection=async(req,res)=>{
    try{
        //data fetch
        const {sectionId,courseId,title,description}=req.body;
        const video=req.files.video;
        //data validation
        // console.log("input fields are,",sectionId,title,description,timeDuration);
        // console.log(video);
        if(!sectionId || !title || !description || !video || !courseId){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        //upload video to cloudinary
        const cloudinaryResponse=await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        // console.log(cloudinaryResponse);
        //create Sub Section
        const newSubSection=await SubSection.create({title:title,
            timeDuration:cloudinaryResponse.duration,
            description,
            videoUrl:cloudinaryResponse.secure_url,
        });
        //update Section with subsection objectID
        const updatedSection=await Section.findByIdAndUpdate(sectionId,{
            $push:{
                subSection:newSubSection._id,
            }
        },{new:true}).populate("subSection").exec();

        const courseResponse = await Course.findById(courseId).populate({
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          })
          .exec();
        //return res
        return res.status(200).json({
            success:true,
            message:"SubSection created successfully",
            newSubSection,
            courseResponse:courseResponse,
        })

    }catch(err){
        return res.status(500).json({
            success:false,
            error:err.message,
            message:"Could not create Sub Section"
        })
    }
}

//update subsection

exports.updateSubSection=async(req,res)=>{
    try{
        //data fetch
        const {subSectionId,courseId,sectionId,title,description}=req.body;
        
        //data validation
        if( !subSectionId ||! courseId){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        //upload video to cloudinary
        
 
        let cloudinaryResponse;
        let updatedSubSection
        if(req.files){
            const video=req.files.video;
            cloudinaryResponse=await uploadImageToCloudinary(video,process.env.FOLDER_NAME);

            updatedSubSection=await SubSection.findByIdAndUpdate(subSectionId,
                {
                     title:title,
                     timeDuration:cloudinaryResponse.duration,
                     description:description,
                     videoUrl:cloudinaryResponse.secure_url,
                },{new:true});
        }
        else{
            updatedSubSection=await SubSection.findByIdAndUpdate(subSectionId,
                {   
                    title:title,
                     description:description,
                },{new:true});
        }
        
        
           const courseResponse = await Course.findById(courseId).populate({
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          })
          .exec();
        //return res
        return res.status(200).json({
            success:true,
            message:"SubSection updated successfully",
            updatedSubSection,
            courseResponse: courseResponse,
        })

    }catch(err){
        return res.status(500).json({
            success:false,
            error:err.message,
            message:"Could not update Sub Section"
        })
    }
}


//delete a sub section
exports.deleteSubSection=async(req,res)=>{
    try{
        const {subSectionId,sectionId,courseId}=req.body;
        await Section.findByIdAndUpdate(sectionId,{
            $pull:{
                subSection:subSectionId
            }
        })
        await SubSection.findByIdAndDelete(subSectionId);
        //have not yet deleted it from courseContent

        const courseResponse = await Course.findById(courseId).populate({
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          })
          .exec();
        return res.status(200).json({
            success:true,
            courseResponse,
            message:"Sub Section deleted successfully",
        })

    }catch(err){
        return res.status(500).json({
            success:false,
            error:err.message, 
            message:"Could not delete sub section"
        })
    }
}

exports.getSubSectionDetails=async(req,res)=>{
    try{
        const {subSectionId}=req.params;
        const subSectionDetails=await SubSection.findById({subSectionId});
        const courseResponse = await Course.findById(courseId).populate({
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          })
          .exec();
        return res.status(200).json({
            success:true,
            message:"Sub Section Details fetched successfully",
            data:{subSectionDetails,courseResponse,}
            
        })
        

    }catch(err){
        return res.status(500).json({
            success:false,
            error:err.message, 
            message:"Could not get sub section details"
        })
    }
}