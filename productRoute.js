import express from "express";
import {
  createProduct,
  getAProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  filterProduct, // assumed to be implemented
} from "../controllers/productCtrl.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// CREATE
router.post("/", authMiddleware, isAdmin, createProduct);

// READ
router.get("/:id", getAProduct);
router.get("/", getAllProduct);

// UPDATE
router.put("/:id", authMiddleware, isAdmin, updateProduct);

// DELETE
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

// OPTIONAL: Filtering (e.g., /api/products/filter?category=shoes)
router.get("/filter/query", filterProduct); // Ensure you implement this in your controller

export default router;

