import express from "express";
import dotenv from "dotenv";
import dbConnect from "./dbconnect.js";
import authRouter from "./authRoute.js";
import { errorHandler, notFound } from "./errorHandler.js"; // Corrected typo in import

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;
const authRouter = require("./routes/authRoute");
const cookieParser = require("cookie-parser");

// Connect to MongoDB
dbConnect();

// Middleware
app.use(express.json());

// Routes
app.use("/api/user", authRouter);
app.use

// Error Handlers
app.use(notFound);
app.use(errorHandler);

// Root Route
app.get("/", (req, res) => {
    res.send("Hello from server side");
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
