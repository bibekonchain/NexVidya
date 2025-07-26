import express from "express";
import { generateCertificate } from "../controllers/certificateController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/generate", isAuthenticated, generateCertificate);

export default router;
