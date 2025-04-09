
const mongoose = require('mongoose');

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("Database error:", error.message);
    process.exit(1);
  }
};

module.exports = dbConnect;
