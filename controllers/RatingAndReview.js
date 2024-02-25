

const RatingAndReview=require('../models/RatingAndReview');
const Course =require('../models/Course');
const { default: mongoose } = require('mongoose');


exports.createRating =async (req,res) => {



    try {

    const userId =req.user.id;
    const {rating,review,courseId} =req.body;

    const  courseDetails =await Course.findOne({_id:courseId,
        studentsEnrolled:{$elemMatch : {$eq: userId}}

    })

    if(!courseDetails) {
        return res.status(404).json({
            success:false,
            message:'Student is not enrolled in the course'
        })
    }

    const alreadyReviwed =await RatingAndReview.findOne({
        user:userId,
        course:courseId
    })


    if(alreadyReviwed) {
        return res.status(400).json({
            success:false,
            message:'coures is already  reviewed by  the user '
        })
    }


    const ratingReview =await  RatingAndReview.create({
        rating, review,
        course:courseId, user:userId
    })

    await Course.findByIdAndUpdate(courseId,{
        $push:{
            ratingAndReviews:ratingReview._id
        }
    },{new:true})


return res.status(200).json({

    success:true,
    message:'rating and review created Successfully',
    ratingReview,
})

    }catch(error) {

return res.status(500).json({

    succes:false,
    message:error.message,
})


    }

}


exports.getAverageRating =async (req,res) => {


try {


    const  courseId =req.body.courseId;
 
    const result  =await  RatingAndReview.aggregate([{
        $match:{
            Course:new mongoose.Types.ObjectId(courseId),

        },
        
    },
{
    $group:{
        _id:null,
        averageRating:{$avg:"$rating"}
    }
}])

if(result.length>0) {

    return res.status(200).json({
        success:true,
        averageRating:result[0].averageRating
    })
}

return res.status(200).json({
    success:true,
    message:'Average Rating IS 0, NO RATING GIVEN TILL NOW',
    averageRating:0
})


} catch(error) {

    return res.status(400).json({
        success:false,
        message:error.message
    })

}


}


exports.getAllRating =async (req,res) =>  {

    try {

const allReviews=await RatingAndReview.find({}).sort({rating:"desc"})
.populate({
    path:'user',
    select:'firstName lastname email image'
}).populate({
    path:'course',
    select:"courseName"
}).exec()

return res.status(200).json({
    succes:true,
    message:'All reviews fetched successfully',
    data:allReviews
})



    } catch(error) {
return res.status(500).json({
    success:true,
    message:error.message
})
    }
}