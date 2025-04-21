import express from "express";
import dotenv from "dotenv";
import dbConnect from "./dbconnect.js";
import authRouter from "./authRoute.js";
import { errorHandler, notFound } from "./errorHandler.js";
import productRouter from "./routes/productRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import orderRouter from "./routes/orderRoute.js";
import cartRouter from "./routes/cartRoute.js";

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
dbConnect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/user", authRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/cart", cartRouter);

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
