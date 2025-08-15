import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  generateCertificate,
  getCertificateByCourseId,
} from "../controllers/certificateController.js";

const router = express.Router();

// 📄 Download certificate (if already issued)
router.get("/:courseId", isAuthenticated, getCertificateByCourseId);

// 🧾 Generate certificate (optional, if you still want a manual trigger)
router.post("/generate", isAuthenticated, generateCertificate);

export default router;
