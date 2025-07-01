// routes/admin.route.js
import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isAdmin from "../middlewares/isAdmin.js";
import {
  getAllUsers,
  getUserDetails,
  getAdminStats,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(isAuthenticated, isAdmin);

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserDetails);

export default router;
