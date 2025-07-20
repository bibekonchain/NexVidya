// routes/admin.route.js
import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isAdmin from "../middlewares/isAdmin.js";
import {
  getAllUsers,
  getUserDetails,
  getAdminStats,
} from "../controllers/admin.controller.js";
import { updateUserRole } from "../controllers/admin.controller.js";
import { getInstructorRequests } from "../controllers/admin.controller.js";


const router = express.Router();

router.use(isAuthenticated, isAdmin);
router.put("/users/:userId", updateUserRole);
router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserDetails);
router.get("/instructor-requests", getInstructorRequests);

export default router;
