
import mongoose from 'mongoose';

const dbConnect = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL environment variable is not defined");
    }

    if (mongoose.connection.readyState >= 1) {
      console.log("🔁 Reusing existing MongoDB connection");
      return;
    }

    await mongoose.connect(process.env.MONGODB_URL);

    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    // Don't exit the process, let the app continue running without DB
    console.log("⚠️ Application running without database connection");
  }
};

export default dbConnect;
