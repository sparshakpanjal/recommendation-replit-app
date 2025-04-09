
const express = require("express");
const dbConnect = require("./dbconnect");
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const authRouter = require("./authRoute");

// Connect to database
dbConnect();

// Middleware
app.use(express.json());

// Routes
app.use("/api/user", authRouter);

// Root route
app.get("/", (req, res) => {
    res.send("Hello from server side");
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at PORT ${PORT}`);
});
