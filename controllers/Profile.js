const Profile = require("../models/Profile")
const mongoose = require("mongoose")
const CourseProgress = require("../models/CourseProgress")
const Course = require("../models/Course")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const { convertSecondsToDuration } = require("../utils/secToDuration")

exports.updateProfile = async (req,res) => {
    try {

       const {dateOfBirth="",
       about="",
       firstName = "",
       lastName = "",
       contactNumber='',gender=''} =req.body;

       const  id =req.user.id;


       const userDetails =await User.findById(id);
       const profileId = userDetails.additionalDetails;
       const ProfileDetails=await Profile.findById(profileId);

       
    const user = await User.findByIdAndUpdate(id, {
        firstName,
        lastName,
      })
      await user.save()
  

       ProfileDetails.dateOfBirth = dateOfBirth;
       ProfileDetails.about =about;
       ProfileDetails.gender=gender;
       ProfileDetails.contactNumber=contactNumber;

       await ProfileDetails.save();

       const updatedUserDetails = await User.findById(id)
       .populate("additionalDetails")
       .exec()

       return res.status(200).json({
        success:true,
        message: "Profile updated successfully",
      updatedUserDetails,
       })


    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success:false,
            error:error.message
        })

    }
}

//deleteaccount


exports.deleteAccount =async (req,res) => {
    try {

        const id = req.user.id
        console.log(id)
        const user = await User.findById({ _id: id })
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          })
        }
        // Delete Assosiated Profile with the User
        await Profile.findByIdAndDelete({
          _id: new mongoose.Types.ObjectId(user.additionalDetails),
        })
        for (const courseId of user.courses) {
          await Course.findByIdAndUpdate(
            courseId,
            { $pull: { studentsEnroled: id } },
            { new: true }
          )
        }
        // Now Delete User
        await User.findByIdAndDelete({ _id: id })
        res.status(200).json({
          success: true,
          message: "User deleted successfully",
        })
        await CourseProgress.deleteMany({ userId: id })

    } catch(error) {

        return res.status(500).json({
            success:false,
            message:'User  cannot be deleted successfully'
        })

    }
}


exports.getAllUserDetails =async (req,res) => {

    try{

        const id=req.user.id;

        const userDetails=await User.findById(id).populate("additionalDetails").exec()


        return res.status(200).json({
            success:true,
            message:'User Data Fetched Successfully',
            data:userDetails
        })

    } catch(error) {

        return res.status(500).json({
            success:false,
            error:error.message
        })

    }
}


exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      let userDetails = await User.findOne({
        _id: userId,
      })
        .populate({
          path: "courses",
          populate: {
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          },
        })
        .exec()
      userDetails = userDetails.toObject()
      var SubsectionLength = 0
      for (var i = 0; i < userDetails.courses.length; i++) {
        let totalDurationInSeconds = 0
        SubsectionLength = 0
        for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
          totalDurationInSeconds += userDetails.courses[i].courseContent[
            j
          ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
          userDetails.courses[i].totalDuration = convertSecondsToDuration(
            totalDurationInSeconds
          )
          SubsectionLength +=
            userDetails.courses[i].courseContent[j].subSection.length
        }
        let courseProgressCount = await CourseProgress.findOne({
          courseID: userDetails.courses[i]._id,
          userId: userId,
        })
        courseProgressCount = courseProgressCount?.completedVideos.length
        if (SubsectionLength === 0) {
          userDetails.courses[i].progressPercentage = 100
        } else {
          // To make it up to 2 decimal point
          const multiplier = Math.pow(10, 2)
          userDetails.courses[i].progressPercentage =
            Math.round(
              (courseProgressCount / SubsectionLength) * 100 * multiplier
            ) / multiplier
        }
      }
  
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }



//updateDisplayPicture


exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(displayPicture)
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      console.log(updatedProfile)
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

//instructor dashboard
exports.instructorDashboard = async (req, res) => {
	try {

		const courseData = await Course.find({instructor:req.user.id});
		const courseDetails = courseData.map((course) => {
		const	totalStudents = course?.studentsEnrolled?.length;
		const	totalRevenue = course?.price * totalStudents;
			const courseStats = {
				_id: course._id,
				courseName: course.courseName,
				courseDescription: course.courseDescription,
				totalStudents,
				totalRevenue,
			};
			return courseStats;
    });
		res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: courseDetails,
		});
	} catch (error) {
        console.error(error)
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}