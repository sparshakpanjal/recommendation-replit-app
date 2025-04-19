
import express from "express";
import userCtrl from './userCtrl.js';
import { authMiddleware, isAdmin } from './authMiddleware.js';

const router = express.Router();

// Public Routes
router.post("/register", userCtrl.createUser);
router.post("/login", userCtrl.loginUser);

// Protected Routes
router.get("/all", authMiddleware, isAdmin, userCtrl.getAllUsers);
router.get("/:id", authMiddleware, userCtrl.getUser);
router.put("/:id", authMiddleware,isAdmin,blockUser, userCtrl.updateUser); 
router.delete("/:id", authMiddleware, isAdmin,unblockUser, userCtrl.deleteUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);

export default router;
