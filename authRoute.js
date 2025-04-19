
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
router.put("/:id", authMiddleware, isAdmin, userCtrl.updateUser); 
router.delete("/:id", authMiddleware, isAdmin, userCtrl.deleteUser);
router.get("/refresh", userCtrl.handleRefreshToken);
router.get("/logout", userCtrl.logout);
router.put("/block-user/:id", authMiddleware, isAdmin, userCtrl.blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, userCtrl.unblockUser);

export default router;
