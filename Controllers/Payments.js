const {instance}=require("../config/razorpay");
const Course=require("../Models/Course");
const User=require("../Models/User");
const mailSender=require("../Utils/mailSender")
// const courseEnrollmentEmail=require("../mailTemplate/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");
const {paymentSuccessEmail}=require("../mail/templates/paymentSuccessEmail");
const crypto=require("crypto");


exports.capturePayment= async (req,res)=>{

    const {courses}=req.body;
    const {userId}=req.user.id;

    if(courses.length==0){
        return res.json({
            success:false,
            message:"Please provide course Id"
        })
    }

    let totalAmount=0;
    for(const course_id of courses){
        let course;
        try{
            course=await Course.findById(course_id);
            totalAmount+=course.price;
            if(!course){
                return res.status(200).json({
                    success:false,
                    message :"Could not find course"
                })
            }
            // const uid=new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(userId)){
                totalAmount=0;
                return res.status(200).json(
                    {
                        success:false,
                        message:"Student already Enrolled"

                    }
                )
            }

        }catch(err){
            return res.status().json({
                success:false,
                message:err.message,
            })
        }
    }

    const options={
        amount:totalAmount*100,
        currency:"INR",
        receipt:Number(Math.random(Date.now()*10000000)).toString(),
    }

    try{
        const paymentResponse=await instance.orders.create(options);
        // console.log(paymentResponse);
        return res.json({
            success:true,
            message:paymentResponse
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Could not initiate order",
        })
    }
}


exports.verifyPayment=async (req,res)=>{
    try{
        const razorpay_order_id=req.body?.razorpay_order_id;
        const razorpay_payment_id=req.body?.razorpay_payment_id;
        const razorpay_signature=req.body?.razorpay_signature;
        const courses=req.body?.courses;
        const userId=req.user.id;

        if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature
            || !courses || !userId
        ){
            return res.status(404).json({
                success:false,
                message:"Payment Failed",
            })
        }

        // console.log("All details from signature ",razorpay_order_id,razorpay_payment_id,razorpay_signature,courses,userId);

        let body=razorpay_order_id + "|" +razorpay_payment_id;
        const expectedSignature=crypto
                                .createHmac("sha256",process.env.RAZORPAY_SECRET)
                                .update(body.toString())
                                .digest("hex");

                                // console.log("Expected Signature : ",expectedSignature,)
        if(expectedSignature==razorpay_signature){
            //enroll in courses
            await enrollStudents(courses,userId,res)

            //return res
            return res.status(200).json({
                success:true,
                message:"Payment Verified",
            })
        }
        return res.status(200).json({
            success:"false",
            message:"Payment Failed"
        })
    }catch(err){
        console.log("Error during payment capture",err);
        // console.log(err.message)
    }
}


exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body
  
    const userId = req.user.id
  
    if (!orderId || !paymentId || !amount || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all the details" })
    }
  
    try {
      const enrolledStudent = await User.findById(userId)
  
      await mailSender(
        enrolledStudent.email,
        `Payment Received`,
        paymentSuccessEmail(
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
          amount / 100,
          orderId,
          paymentId
        )
      )
    } catch (error) {
      console.log("error in sending mail", error)
      return res
        .status(400)
        .json({ success: false, message: "Could not send email" })
    }
  }

const enrollStudents=async(courses,userId, res)=>{

    if(!courses || !userId){
        return res.status(400).json({
            success:false,
            message:"Please provide courses, userId"
        })
    }
    try{
        for(const courseId of courses){
            const enrolledCourse=await Course.findOneAndUpdate(
                {
                    _id:courseId
                },
                {
                    $push:{
                        studentsEnrolled:userId,
                    }
                },{
                    new:true
                }
            )
            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:"Course Not found",
                })
            }
    
            const enrolledStudent=await User.findOneAndUpdate({_id:userId},
                {
                    $push:{
                        courses:courseId
                    }
                },{
                    new:true,
                }
            )
    
            if(!enrolledStudent){
                return res.status(500).json({
                    success:false,
                    message:"User enrollment failed",
                })
            }
            return ;
            // const emailResponse=await mailSender(
            //     enrollStudents.email,
            //     `Successfully Enrolled into ${enrolledCourse.courseName}`,
            //     courseEnrollmentEmail(enrolledCourse.courseName,`${enrolledStudent.firstName}`)
            // )
            
            // console.log("Email Sent successfully",emailResponse.response)
        }
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message,
        })
    }

}














// //capture the payment and initiate the razorpay order
// exports.capturePayment=async(req,res)=>{
//     try{
//         //get user id and course id
//         const {course_id}=req.body;
//         const userId=req.user.id;
//         //validation
//         if(!course_id){
//             return res.status(400).json({
//                 success:false,
//                 message:"Please provide the course id"
//             })
//         }
//         let course;
//         try{
//             course=await Course.findById({course_id});
//             if(!course){
//                 return res.status(404).json({
//                     success:false,
//                     message:"Could not found course"
//                 })
//             }
//             //already paid by the user
//             const uid=new mongoose.Types.ObjectId(userId);
//             if(course.studentsEnrolled.includes(uid)){
//                 return res.status(200).json({
//                     success:false,
//                     message:"Student already enrolled in the Course"
//                 })
//             }


//         }catch(err){
//             console.log(err);
//             return res.status(500).json({
//                 success:false,
//                 message:"Course and User verification failed during payment"
//             })
//         }
        
//         //create the order 
//         const amount=course.price;
//         const currency="INR";
//         const options={
//             amount:amount*100,
//             currency:currency,
//             receipt:Math.random(Date.now()).toString(),
//             notes:{
//                 courseId:course.id,
//                 userId:userId,
//             }
//         }
//         try{
//             //Initiating the payment
//             const paymentResponse=await instance.orders.create(options);
//             console.log(paymentResponse);

//             res.status(200).json({
//                 success:true,
//                 courseName:course.courseName,
//                 courseDescription:course.courseDescription,
//                 thumbnail:course.thumbnail,
//                 orderId:paymentResponse.id,
//                 currency:paymentResponse.currency,
//                 amount:paymentResponse.amount,
//             })

//         }catch(err){
//             console.log(err);
//             res.json({
//                 success:false,
//                 message:"Could Not create Order"
//             })
//         }

//     }catch(err){
//         console.log(err);
//         res.status(500).json({
//             success:false,
//             message:"Internal Server error while creating  payment order"
//         })
//     }
// }



// //verify signature of razorpay and server

// exports.verifySignature=async(req,res)=>{
//     try{
//         const webhookSecret="12345678";
//         const signature=req.header["x-razorpay-signature"];

//         const shaSum=crypto.createHmac("sha256",webhookSecret);
//         shaSum.update(JSON.stringify(req.body));
//         const digest=shaSum.digest("hex");

//         //[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]
//         if(digest==signature){
//             const {courseId,userId}=req.body.payload.entity.notes;
//             try{
//                 //find the course and enroll the user in it
//                 const enrolledCourse=await Course.findOneAndUpdate({_id:courseId},
//                     {$push:{
//                             studentsEnrolled:userId,
//                         }
//                     },{new:true}
//                 );
//                 if(!enrolledCourse){
//                     return res.status(500).json({
//                         success:false,
//                         message:"Course not Found during course enrollment",
//                     })
//                 }
//                 console.log(enrolledCourse);

//                 //find user and add course list 
//                 const enrolledStudent=await User.findOneAndUpdate({_id:userId},
//                     {$push:{
//                         courses:courseId
//                     }},{new:true}
//                 );
//                 if(!enrolledStudent){
//                     return res.status(500).json({
//                         success:false,
//                         message:"Student not Found during course enrollment",
//                     })
//                 }
//                 console.log(enrolledStudent);
//                 const emailResponse=await mailSender(enrolledStudent.email,
//                     "Congratulations",`${enrolledStudent.firstName}, enrolled in the Course ${enrolledCourse.courseName}`
//                 )

//                 return res.status(200).json({
//                     success:true,
//                     message:"Successfully course enrollment"
//                 })

//             }catch(err){
//                 console.log(err);
//                 res.status(500).json({
//                     success:false,
//                     message:"Error during the payment verification and user enrollment"
//                 })
//             }
//         }else{
//             res.status(500).json({
//                 success:false,
//                 message:"Signature not matched during payment gateway"
//             })
//         }
//     }catch(err){
//         console.log("Error during payment verification",err);
//         res.status(500).json({
//             success:false,
//             message:"Error during payment verification"
//         })
//     }
// }
