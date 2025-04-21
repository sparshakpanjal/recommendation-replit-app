
import express from "express";
import cartCtrl from "../controllers/cartCtrl.js";
import { authMiddleware } from "../authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, cartCtrl.getUserCart);
router.post("/add", authMiddleware, cartCtrl.addToCart);
router.put("/update", authMiddleware, cartCtrl.updateCartItem);
router.delete("/clear", authMiddleware, cartCtrl.clearCart);
router.delete("/:productId", authMiddleware, cartCtrl.removeFromCart);

export default router;
