
const mongoose = require('mongoose');

const dbConnect = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL environment variable is not defined");
    }
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("Database error:", error.message);
    process.exit(1);
  }
};

module.exports = dbConnect;
