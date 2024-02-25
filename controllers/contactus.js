
const { contactUsEmail } = require("../mail/templates/contactFormRes")
const mailSender = require("../utils/mailSender")


exports.contactUs = async (req,res) => {

    const {firstName,lastName,email,message,phoneNo,countrycode} =req.body;

    
if(!firstName||!lastName||!email ) {

    return res.status(400).json({
success:false,
message:'All field are required'
    })
}
    try {
const emailRes =await mailSender(email,'Your data send successfully',

contactUsEmail(email,firstName,lastName,message,phoneNo,countrycode))

console.log("Email Res ", emailRes)
return res.json({
    success: true,
    message: "Email send successfully",
  })

    } catch (error){
        
    
        console.log("Error", error)
        console.log("Error message :", error.message)
        return res.json({
          success: false,
          message: "Something went wrong...",
        })
    


}

}


