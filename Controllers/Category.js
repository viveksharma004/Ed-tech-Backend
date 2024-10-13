const Category=require("../Models/Category");

// create tag handler
exports.createCategory=async(req,res)=>{
    try{
        const {name,description}=req.body;
        if(!name || !description) return res.status(400).json({
            success:false,
            message:"All fields are required"
        })
        const categoryDetails=await Category.create({name:name,description:description});
        console.log(categoryDetails);

        return res.status(200).json({
            success:true,
            message:"Category created successfully"
        })

    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}


//get all tags
exports.showAllCategory=async(req,res)=>{
    try{
        const allCategories=await Category.find({},{name:true,description:true});

        return res.status(200).json({
            success:true,
            message:"All tags got in all tags",
            allCategories,
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
            data:"could not find tag"
        })
    }
}



// exports.categoryPageDetails=async(req,res)=>{
//     try{
//         const {categoryId}=req.body;
//         const selectedCategory=await Category.findById(categoryId).populate("course").exec();
//         if(!selectedCategory){
//             return res.status(404).json({
//                 success:false,
//                 message:"Data not found",
//             })
//         }
//         const diffCourses=await Category.find({_id: {$ne: categoryId}}).populate("course").exec();

//         //finding the top selling courses

//         return res.status(200).json({
//             success:true,
//             data:{
//                 selectedCategory,
//                 diffCourses,
//             },
//         });


//     }catch(err){
//         return res.status(500).json({
//             success:false,
//             message:err.message,
//             data:"could not find tag"
//         })
//     }
// }


function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

exports.categoryPageDetails = async (req, res) => {
    try {
      const { categoryId } = req.body
      console.log("PRINTING CATEGORY ID: ", categoryId);
      // Get courses for the specified category
      let selectedCategory ;
      selectedCategory= await Category.findById(categoryId)
        .populate({
          path: "course",
          match: { status: "Published" },
          populate: "ratingAndReviews",
          populate: {
            path: "instructor",
          }
        })
        .exec()
  
      //console.log("SELECTED COURSE", selectedCategory)
      // Handle the case when the category is not found
      if (!selectedCategory) {
        console.log("Category not found.")
        return res
          .status(404)
          .json({ success: false, message: "Category not found" })
      }
      // Handle the case when there are no courses
      if (selectedCategory.course.length === 0) {

        // console.log("No courses found for the selected category.")
        // return res.status(404).json({
        //   success: false,
        //   message: "No courses found for the selected category.",
        // })
      }
  
      // Get courses for other categories
      const categoriesExceptSelected = await Category.find({
        _id: { $ne: categoryId },
      })
      // console.log("Excepted categories left :", categoriesExceptSelected)
      let differentCategory = await Category.findOne(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id 
      )
        .populate({
          path: "course",
          match: { status: "Published" },
          populate: {
            path: "instructor",}
        })
        .exec()
        //console.log("Different COURSE", differentCategory)
      // Get top-selling courses across all categories
      const allCategories = await Category.find()
        .populate({
          path: "course",
          match: { status: "Published" },
          populate: {
            path: "instructor",
        },
        })
        .exec()
      const allCourses = allCategories.flatMap((category) => category.course)
      // const topCourses
      const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)
       // console.log("mostSellingCourses COURSE", mostSellingCourses)
      res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          differentCategory,
          mostSellingCourses,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }