


const mongoose=require('mongoose');
const mailSender = require('../utils/mailSender');
const emailTemplate = require("../mail/templates/emailVerification");
const OTPSchema = new mongoose.Schema({


email:{
    type:String,
    required:true,
    
},

otp:{
    type:String,
    required:true

},

createdAt:{
    type:Date,
    default:Date.now,
    expires:60*5
}


})

async function sendVerificationEmail(email,otp) {

    try {
        const mailResponse=await mailSender(email,
            "Verification Email from StudyNotion",emailTemplate(otp))
console.log("Email send successfully",mailResponse.response)
    } catch(error){
        console.log("error occured while sending mail: ",error);
        throw error;
    }
}

OTPSchema.pre('save',async function(next) {

if(this.isNew) {
    await sendVerificationEmail(this.email,this.otp);
}
    next()
})


module.exports =mongoose.model("OTP",OTPSchema);