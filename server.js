const express=require("express");
const app=express();
const userRoutes=require("./Routes/User");
const profileRoutes=require("./Routes/Profile");
const paymentRoutes=require("./Routes/Payments");
const courseRoutes=require("./Routes/Course");
const {dbConnect}=require("./config/databaseConnect");
const {cloudinaryConnect}=require("./config/cloudinaryConnect");
const cookieParser=require("cookie-parser");
const cors=require("cors");
const fileUpload=require("express-fileupload");
require("dotenv").config();

app.use(express.json());
require("dotenv").config();
const PORT=process.env.PORT || 8000;

dbConnect();
//middlewares
app.use(express.json())
app.use(cookieParser());
app.use(cors());


app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp",
}))

cloudinaryConnect();

app.use("/api/v1/auth",userRoutes);
app.use("/api/v1/profile",profileRoutes);
app.use("/api/v1/course",courseRoutes);
app.use("/api/v1/payment",paymentRoutes);


app.listen(PORT,()=>{
    console.log(`server started at ${PORT}`);
});
app.get("/",(req,res)=>{
    res.send("This is the server ")
})