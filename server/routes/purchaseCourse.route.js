import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createCheckoutSession,
  getAllPurchasedCourse,
  getCourseDetailWithPurchaseStatus,
  stripeWebhook,
  initiateEsewaPayment,
  verifyEsewaPayment,
  verifyEsewaRedirect,
} from "../controllers/coursePurchase.controller.js";

const router = express.Router();

router.route("/checkout/create-checkout-session").post(isAuthenticated, createCheckoutSession);
router.route("/webhook").post(express.raw({type:"application/json"}), stripeWebhook);
router.route("/course/:courseId/detail-with-status").get(isAuthenticated,getCourseDetailWithPurchaseStatus);

router.route("/").get(isAuthenticated,getAllPurchasedCourse);

router.post(
  "/checkout/create-checkout-session",
  isAuthenticated,
  createCheckoutSession
);
router.post("/checkout/initiate-esewa", isAuthenticated, initiateEsewaPayment);
router.post("/checkout/verify-esewa", verifyEsewaPayment);
router.get("/checkout/verify-esewa", verifyEsewaRedirect);

export default router;