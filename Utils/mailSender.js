const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
    try{
        console.log("env",process.env.MAIL_PASS,process.env.MAIL_HOST,process.env.MAIL_USER); 
            let transporter = nodemailer.createTransport({
                    host:process.env.MAIL_HOST,
                    port:465,
                    auth:{
                        user: process.env.MAIL_USER,
                        pass: process.env.MAIL_PASS,
                    }
            });


            let info = await transporter.sendMail({
                from: 'StudyNotion || Vivek Sharma',
                to:`${email}`,
                subject: `${title}`,
                html: `${body}`,
            })
            //console.log(info);
            return info;
    }
    catch(error) {
        console.log(error.message);
        console.log(error);
    }
}


module.exports = mailSender;
