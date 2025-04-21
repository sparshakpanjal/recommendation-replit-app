import mongoose from 'mongoose';

const dbConnect = async () => {
  try {
    // Use MongoDB Atlas or local MongoDB
    const mongoUrl = process.env.MONGODB_URL || "mongodb://localhost:27017/ecommerce";

    if (mongoose.connection.readyState >= 1) {
      console.log("🔁 Reusing existing MongoDB connection");
      return;
    }

    await mongoose.connect(mongoUrl);

    console.log("✅ MongoDB Connected Successfully");
    return mongoose.connection;
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

export default dbConnect;


