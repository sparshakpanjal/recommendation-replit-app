
import express from "express";
import productCtrl from "../controllers/productCtrl.js";
import { authMiddleware, isAdmin } from "../authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", productCtrl.getAllProducts);
router.get("/:id", productCtrl.getProduct);

// Protected routes
router.post("/", authMiddleware, isAdmin, productCtrl.createProduct);
router.put("/:id", authMiddleware, isAdmin, productCtrl.updateProduct);
router.delete("/:id", authMiddleware, isAdmin, productCtrl.deleteProduct);
router.post("/:id/reviews", authMiddleware, productCtrl.createProductReview);

export default router;
