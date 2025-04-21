
import express from "express";
import productCtrl from "../controllers/productCtrl.js";
import { authMiddleware, isAdmin } from "../authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, productCtrl.createProduct);
router.get("/:id", productCtrl.getProduct);
router.put("/:id", authMiddleware, isAdmin, productCtrl.updateProduct);
router.delete("/:id", authMiddleware, isAdmin, productCtrl.deleteProduct);
router.get("/", productCtrl.getAllProducts);

export default router;
