import express from "express";
import { getCourseRecommendations } from "../controllers/recommendationController.js";

const router = express.Router();

// GET /api/v1/recommendations/:userId
router.get("/:userId", getCourseRecommendations);

export default router;
