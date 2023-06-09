import mongoose  from "mongoose";

const connectDB = async ()=>{
    try {
      const connectToDb =  await  mongoose.connect(process.env.MONGO_URL)
      // console.log(`Connected to ${connectToDb.connection.host}` .bgGreen.bold)
    } catch (error) {
      //  console.log(`MongoDB error ${error}` .bgRed); 
    }
}

export default connectDB