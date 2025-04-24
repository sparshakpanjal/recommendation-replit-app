import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler, notFound } from "./errorHandler.js";
import authRouter from "./authRoute.js";

// Config
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/user", authRouter);

// Dynamically load routes
const productRouter = (await import("./routes/productRoute.js")).default;
const categoryRouter = (await import("./routes/categoryRoute.js")).default;
const orderRouter = (await import("./routes/orderRoute.js")).default;
const cartRouter = (await import("./routes/cartRoute.js")).default;
const recommendationRouter = (await import("./routes/recommendationRoute.js")).default;

app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/cart", cartRouter);
app.use("/api/recommendations", recommendationRouter);

// Root Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 404 & Error Middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is live @ http://0.0.0.0:${PORT}`);
});
