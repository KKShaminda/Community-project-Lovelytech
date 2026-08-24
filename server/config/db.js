import mongoose from "mongoose";
import colors from "colors";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("Error in MongoDB: MONGO_URI is not defined in environment variables".bgRed.white);
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri); // env variable
    console.log(
        `Connected to MongoDB Database: ${conn.connection.host}`.bgMagenta.white
    );
  } catch (error) {
    console.error(`Error in MongoDB: ${error.message}`.bgRed.white);
    process.exit(1); // Stop server if DB fails
  }
};

export default connectDB;
