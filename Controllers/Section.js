const Section = require("../Models/Section");
const Course = require("../Models/Course");
const SubSection=require("../Models/SubSection");

exports.createSection = async (req, res) => {
  try {
    //data fetch
    const { sectionName, courseId } = req.body;
    //data validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //create section
    const newSection = await Section.create({ sectionName });
    //update course with section objectID
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    // console.log("Updated Course :: ", updatedCourse);
    //populate the section and subsection in course
    //return res
    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      data:updatedCourse,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      message: "Could not create section",
    });
  }
};

//update section

exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId , courseId} = req.body;
    if (!sectionName || !sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        sectionName: sectionName,
      },
      { new: true }
    );
    // console.log("Updated Section Name ::",updatedSection);
    const updatedCourse = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      updatedCourse,
      updatedSection
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      message: "Could not update section",
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body;
    await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})

    const section = await Section.findById(sectionId);
		// console.log(sectionId, courseId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

		//delete sub section
		await SubSection.deleteMany({_id: {$in: section.subSection}});

		await Section.findByIdAndDelete(sectionId);
    //have not yet deleted it from courseContent
    // console.log(response);
    const courseResponse = await Course.findById(courseId).populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    })
    .exec();
    
    
    // console.log(
    //   "Updated course content after deleting section ",
    //   courseResponse
    // );

    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      courseResponse:courseResponse,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      message: "Could not delete section",
    });
  }
};

exports.getAllSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const sectionDetails = await Section.findById(sectionId)
      .populate("subSection")
      .exec();
    return res.status(200).json({
      success: true,
      message: "Section all details",
      data: sectionDetails,
    });
  } catch (err) {
    return res.status({
      success: false,
      message: "Could not get all section details",
      error: err.message,
    });
  }
};
