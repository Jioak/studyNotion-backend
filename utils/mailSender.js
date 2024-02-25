
const nodemailar =require("nodemailer");
require('dotenv').config()


const mailSender =async (email,title,body)=>{

    try {

        let transporter=nodemailar.createTransport({
            host:process.env.MAIL_HOST,
            
            auth :{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,

            }
        })

        let info =await transporter.sendMail({
            from:`"Study Notion <${process.env.MAIL_USER}>`,
            to: `${email}`,
            subject:`${title
            }`,
            html:`${body
            }`

        })
        console.log(info);
        return info;

        

    } catch (error) {
        console.log(error.message)

    }
}


module.exports=mailSender;
