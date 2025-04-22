import express from "express";
import dotenv from "dotenv";
import dbConnect from "./dbconnect.js";
import authRouter from "./authRoute.js";
import { errorHandler, notFound } from "./errorHandler.js"; // Corrected typo in import

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to PostgreSQL
import { dbConnect } from "./dbconnect.js";

(async () => {
  try {
    await dbConnect();
    console.log("Database connection established");
  } catch (error) {
    console.log("Database connection error, but server will continue running");
  }
})();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use("/api/user", authRouter);
app.use("/api/products", (await import("./routes/productRoute.js")).default);
app.use("/api/categories", (await import("./routes/categoryRoute.js")).default);
app.use("/api/orders", (await import("./routes/orderRoute.js")).default);
app.use("/api/cart", (await import("./routes/cartRoute.js")).default);
app.use("/api/recommendations", (await import("./routes/recommendationRoute.js")).default);

// Error Handlers
app.use(notFound);
app.use(errorHandler);

// Root Route
app.get("/", (req, res) => {
    res.sendFile('public/index.html', { root: '.' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running at http://0.0.0.0:${PORT}`);
});
