import express from "express";
import orderCtrl from "../controllers/orderCtrl.js";
import { authMiddleware, isAdmin } from "../authMiddleware.js";

const router = express.Router();

// Routes for authenticated users
router.post("/", authMiddleware, orderCtrl.createOrder);
router.get("/myorders", authMiddleware, orderCtrl.getMyOrders);
router.get("/:id", authMiddleware, orderCtrl.getOrderById);
router.put("/:id/pay", authMiddleware, orderCtrl.updateOrderToPaid);

// Admin-only routes
router.get("/", authMiddleware, isAdmin, orderCtrl.getAllOrders);
router.put("/:id/status", authMiddleware, isAdmin, orderCtrl.updateOrderStatus);

export default router;
