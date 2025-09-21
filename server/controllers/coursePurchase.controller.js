import Stripe from "stripe";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";
import crypto from "crypto";
import axios from "axios";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId, method = "stripe" } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });

    if (method === "stripe") {
      // Generate unique paymentId for tracking
      const paymentId = `stripe-${Date.now()}-${userId}`;
      const newPurchase = new CoursePurchase({
        courseId,
        userId,
        amount: course.coursePrice,
        status: "pending",
        paymentId: paymentId,
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "npr",
              product_data: {
                name: course.courseTitle,
                images: [course.courseThumbnail],
              },
              unit_amount: course.coursePrice * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/course-progress/${courseId}`,
        cancel_url: `${process.env.FRONTEND_URL}/course-detail/${courseId}`,

        metadata: {
          courseId: String(courseId),
          userId: String(userId),
          purchaseId: String(newPurchase._id),
        },
      });

      if (!session.url) {
        return res
          .status(400)
          .json({ success: false, message: "Error while creating session" });
      }

      newPurchase.paymentId = session.id; // assign paymentId before saving
      await newPurchase.save();

      return res.status(200).json({ success: true, url: session.url });
    }

    if (method === "esewa") {
      // Generate unique paymentId (pid)
      const pid = `nexvidya-${Date.now()}-${userId}`;

      // Save CoursePurchase with paymentId = pid
      const newPurchase = new CoursePurchase({
        courseId,
        userId,
        amount: course.coursePrice,
        status: "pending",
        paymentId: pid,
      });

      await newPurchase.save();

      // Prepare eSewa payload
      const payload = {
        amt: course.coursePrice,
        psc: 0,
        pdc: 0,
        txAmt: 0,
        tAmt: course.coursePrice,
        pid, // use generated pid here
        scd: process.env.ESEWA_MERCHANT_ID,
        su: `${process.env.BACKEND_URL}/api/v1/purchase/checkout/verify-esewa?courseId=${courseId}&userId=${userId}&pid=${pid}`,
        fu: `${process.env.FRONTEND_URL}/course-detail/${courseId}?error=payment_failed`,
      };

      return res.status(200).json({
        success: true,
        url: process.env.ESEWA_PAYMENT_URL,
        esewaPayload: payload,
      });
    }

    return res.status(400).json({ message: "Unsupported payment method" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const stripeWebhook = async (req, res) => {
  let event;

  try {
    const payloadString = JSON.stringify(req.body, null, 2);
    const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret,
    });

    event = stripe.webhooks.constructEvent(payloadString, header, secret);
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  // Handle the checkout session completed event
  if (event.type === "checkout.session.completed") {
    console.log("check session complete is called");

    try {
      const session = event.data.object;

      const purchase = await CoursePurchase.findOne({
        paymentId: session.id,
      }).populate({ path: "courseId" });

      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      if (session.amount_total) {
        purchase.amount = session.amount_total / 100;
      }
      purchase.status = "completed";

      await purchase.save();

      // Update user's enrolledCourses
      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } }, // Add course ID to enrolledCourses
        { new: true }
      );

      // Update course to add user ID to enrolledStudents
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } }, // Add user ID to enrolledStudents
        { new: true }
      );
      console.log("Purchase completed successfully for:", purchase.paymentId);
    } catch (error) {
      console.error("Error handling event:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  res.status(200).send();
};
export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    if (!course) {
      return res.status(404).json({ message: "course not found!" });
    }

    // Check if user has completed purchase
    const purchaseRecord = await CoursePurchase.findOne({
      userId,
      courseId,
      status: "completed",
    });

    // Also check if user is enrolled in the course
    const user = await User.findById(userId);
    const isEnrolled =
      user &&
      user.enrolledCourses.some(
        (enrolledCourseId) =>
          enrolledCourseId.toString() === courseId.toString()
      );

    // User is considered to have purchased if they have a completed purchase OR are enrolled
    const purchased = !!purchaseRecord || isEnrolled;

    console.log("Purchase record:", !!purchaseRecord);
    console.log("Is enrolled:", isEnrolled);
    console.log("Final purchased status:", purchased);

    return res.status(200).json({
      course,
      purchased: purchased,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPurchasedCourse = async (req, res) => {
  try {
    const purchasedCourse = await CoursePurchase.find({
      status: "completed",
    }).populate("courseId");

    return res.status(200).json({
      purchasedCourse: purchasedCourse || [],
    });
  } catch (error) {
    console.error("Error getting purchased courses:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const initiateEsewaPayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const totalAmount = course.coursePrice;
    const uniqueRefId = "REF" + Date.now();

    const hash = crypto
      .createHmac("sha256", process.env.ESEWA_SECRET_KEY)
      .update(`${process.env.ESEWA_MERCHANT_ID},${uniqueRefId},${totalAmount}`)
      .digest("hex");

    const newPurchase = await CoursePurchase.create({
      courseId,
      userId,
      amount: totalAmount,
      status: "pending",
      paymentId: uniqueRefId,
    });

    const payload = {
      amount: totalAmount,
      failure_url: process.env.ESEWA_CANCEL_URL,
      product_delivery_charge: 0,
      product_service_charge: 0,
      product_code: courseId,
      signature: hash,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      success_url: process.env.ESEWA_RETURN_URL,
      tax_amount: 0,
      total_amount: totalAmount,
      transaction_uuid: uniqueRefId,
      merchant_code: process.env.ESEWA_MERCHANT_ID,
    };

    res.status(200).json({
      paymentUrl: process.env.ESEWA_PAYMENT_URL,
      payload,
    });
  } catch (err) {
    console.error("Esewa payment initiation error", err);
    res.status(500).json({ message: "Esewa payment initiation failed" });
  }
};

export const verifyEsewaPayment = async (req, res) => {
  try {
    const { refId, amt, pid } = req.body;

    const response = await axios.post(
      process.env.ESEWA_VERIFY_URL,
      {
        amount: amt,
        referenceId: refId,
        productId: pid,
        merchantCode: process.env.ESEWA_MERCHANT_ID,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status === "COMPLETE") {
      const purchase = await CoursePurchase.findOne({ paymentId: pid });
      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      purchase.status = "completed";
      await purchase.save();

      // Update user enrollment
      await User.findByIdAndUpdate(purchase.userId, {
        $addToSet: { enrolledCourses: purchase.courseId },
      });

      await Course.findByIdAndUpdate(purchase.courseId, {
        $addToSet: { enrolledStudents: purchase.userId },
      });

      return res
        .status(200)
        .json({ message: "Payment verified & course enrolled" });
    } else {
      return res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (err) {
    console.error("eSewa payment verify error:", err);
    res.status(500).json({ message: "Error verifying eSewa payment" });
  }
};

export const verifyEsewaRedirect = async (req, res) => {
  try {
    const { oid, amt, refId } = req.query; // from esewa success redirect
    const { courseId, userId, pid } = req.query;

    const verificationPayload = {
      amt,
      rid: refId,
      pid: oid,
      scd: process.env.ESEWA_MERCHANT_ID,
    };

    const verificationRes = await axios.post(
      "https://rc-epay.esewa.com.np/api/epay/transaction/status/",
      verificationPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (verificationRes.data.status === "COMPLETE") {
      // Find purchase by paymentId (pid), not by document ID
      const purchase = await CoursePurchase.findOne({ paymentId: pid });

      if (purchase) {
        purchase.status = "completed";
        await purchase.save();

        // Update user enrollment
        await User.findByIdAndUpdate(userId, {
          $addToSet: { enrolledCourses: courseId },
        });

        await Course.findByIdAndUpdate(courseId, {
          $addToSet: { enrolledStudents: userId },
        });
      }

      return res.redirect(
        `${process.env.FRONTEND_URL}/course-progress/${courseId}`
      );
    } else {
      return res.redirect(
        `${process.env.FRONTEND_URL}/course-detail/${courseId}?error=payment_failed`
      );
    }
  } catch (error) {
    console.error("eSewa verification error:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/course-detail/${req.query.courseId}?error=server_error`
    );
  }
};
