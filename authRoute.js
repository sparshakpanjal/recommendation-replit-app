
import express from "express";
import userCtrl from './userCtrl.js'; // Changed from '../controller/userCtrl.js' to './userCtrl.js'

const router = express.Router();

// Public Routes
router.post("/register", userCtrl.createUser);
router.post("/login", userCtrl.loginUser);

// Protected Routes - Commented out until these functions are implemented
// router.get("/:id", authMiddleware, isAdmin, getaUser);
// router.delete("/:id", authMiddleware, isAdmin, deleteaUser);
// router.put("/edit-user", authMiddleware, isAdmin, updateUser);
// router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);

export default router;
