import express from "express";
import userCtrl from '../controller/userCtrl.js';

// Now you can use the userCtrl functions or variables here
import {
  createUser,
  loginUser,
} from "../controller/userCtrl.js"; // Corrected import for loginUser
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js"; // Corrected import for authMiddleware

const router = express.Router();

// Public Routes
router.post("/register", createUser);
router.post("/login", loginUser);

// Protected Routes
router.get("/:id", authMiddleware, isAdmin, getaUser);
router.delete("/:id", authMiddleware, isAdmin, deleteaUser);
router.put("/edit-user", authMiddleware, isAdmin, updateUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);

export default router;
