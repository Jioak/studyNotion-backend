//resetpasswordToken

//resetPassword
const User= require("../models/User");
const mailSender=require("../utils/mailSender")
const bcrypt =require("bcrypt")
const crypto = require("crypto");

exports.resetPasswordToken  = async (req,res) => {

    try {
const {email} =req.body;

const user =await User.findOne({email});
if(!user) {

    return res.status(401).json({
        success:false,
        message:"Your Email is not registerd with us"
    })
} 


const token = crypto.randomBytes(20).toString("hex");

const updateDetails=await User.findOneAndUpdate({
    email:email
},{token:token,
resetPasswordExpires:Date.now() + 5*60*1000},{new:true})


console.log("DETAILS", updateDetails);


    const url =`http://localhost:3000/update-password/${token}`;

    await mailSender(email,"password reset link",`password reset link ${url}`)


    return res.json({
        success:true,
        message:'Email send succesfully,  please check email and change password'
    })

} catch(error) {

    return res.status(401).json({
        success:false,
        message:"Something went wrong while sending reset "
    })

}
}

exports.resetPassword = async (req,res) =>{

    try {
    const {password,confirmPassword,token} =req.body;


    if(confirmPassword !== password) {
        return res.json({
            success:false,
            message:"password not matching"
        })
    }

    const userDetails =await User.findOne({token:token});;

    if(!userDetails) {
        return res.json({
            success:false,
            message:"Token  is invaild"
        })
    }
    if(userDetails.resetPasswordExpires > Date.now()) {

        return res.json({
            success:false,
            message:"Token  is expired, please regenerate your token"
        })
    }

    const hashedPassword =await bcrypt.hashedPassword(password,10);

    await User.findOneAndUpdate({
        token:token
    },{password:hashedPassword},{new:true})

    return res.status(200).json({
        success:true,
        message:'password reset succesful'
    })


} catch(error) {

    console.log(error)
    return res.json({
        success:false,
        message:" Something went wrong whille sending reset pwd emaill"
    })

}
}
