import express from "express";
import {
  getUserProfile,
  login,
  logout,
  register,
  updateProfile,
  forgotPassword,
  resetPassword,
  requestInstructor,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update").put(isAuthenticated, upload.single("profilePhoto"), updateProfile);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:email/:token").post(resetPassword);
router.post(
  "/request-instructor",
  isAuthenticated,
  upload.single("documents"),
  requestInstructor
);



export default router;