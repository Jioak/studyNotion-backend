
const mongoose=require('mongoose');
require("dotenv").config();


exports.connect =() => {
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser: true,
        useUnifiedTopology:true,
    })
    .then(() => {
      console.log("Db connected Succesfully")  
    })
    .catch((error) => {
        console.log('Db Connection failed');
        console.error(error);
        process.exit(1);
    })
}
