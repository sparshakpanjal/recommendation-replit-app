
import jwt from "jsonwebtoken";
import User from "./userModel.js";
import asyncHandler from "express-async-handler";

// Auth Middleware
const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    if (req?.headers?.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(" ")[1];
        try {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                if (!user) {
                    throw new Error("User not found");
                }
                req.user = user;
                next();
            }
        } catch (error) {
            throw new Error("Not Authorized or token expired, Please login again");
        }
    } else {
        throw new Error("There is no token attached to header");
    }
});

// Admin Middleware
const isAdmin = asyncHandler(async (req, res, next) => {
    const { email } = req.user;
    const adminUser = await User.findOne({ email });
    if (!adminUser || adminUser.role !== "admin") {
        throw new Error("You are not an admin");
    } else {
        next();
    }
});

export { authMiddleware, isAdmin };
