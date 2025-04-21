
import express from "express";
import categoryCtrl from "../controllers/categoryCtrl.js";
import { authMiddleware, isAdmin } from "../authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", categoryCtrl.getAllCategories);
router.get("/:id", categoryCtrl.getCategory);

// Admin routes
router.post("/", authMiddleware, isAdmin, categoryCtrl.createCategory);
router.put("/:id", authMiddleware, isAdmin, categoryCtrl.updateCategory);
router.delete("/:id", authMiddleware, isAdmin, categoryCtrl.deleteCategory);

export default router;
