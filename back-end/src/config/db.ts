import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://dhanaalakshmit:nyvUHY5Uc3ylEuI2@tutorconnectiondb.ncrwgxb.mongodb.net/?retryWrites=true&w=majority&appName=TutorConnectionDB";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Atlas connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  }
};
