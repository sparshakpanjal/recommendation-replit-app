
import express from "express";
import recommendationCtrl from "../controllers/recommendationCtrl.js";
import { authMiddleware } from "../authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, recommendationCtrl.getRecommendations);

export default router;
