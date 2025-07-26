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
      const newPurchase = new CoursePurchase({
        courseId,
        userId,
        amount: course.coursePrice,
        status: "pending",
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
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
        success_url: `http://localhost:5173/course-progress/${courseId}`,
        cancel_url: `http://localhost:5173/course-detail/${courseId}`,
        metadata: {
          courseId: courseId,
          userId: userId,
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
      const pid = `nexvidya-${Date.now()}`;

      // Prepare eSewa payload
      const payload = {
        amt: course.coursePrice,
        psc: 0,
        pdc: 0,
        txAmt: 0,
        tAmt: course.coursePrice,
        pid, // use generated pid here
        scd: process.env.ESEWA_MERCHANT_ID,
        su: `http://localhost:8080/api/v1/purchase/checkout/verify-esewa?courseId=${courseId}&userId=${userId}`,
        fu: `http://localhost:5173/course-detail/${courseId}`,
      };

      // Save CoursePurchase with paymentId = pid
      const newPurchase = new CoursePurchase({
        courseId,
        userId,
        amount: course.coursePrice,
        status: "pending",
        paymentId: pid,
      });

      await newPurchase.save();

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

      // Make all lectures visible by setting `isPreviewFree` to true
      if (purchase.courseId && purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

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

    const purchased = await CoursePurchase.findOne({
      userId,
      courseId,
      status: "completed",
    });
    console.log(purchased);

    if (!course) {
      return res.status(404).json({ message: "course not found!" });
    }

    return res.status(200).json({
      course,
      purchased: !!purchased, // true if purchased, false otherwise
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllPurchasedCourse = async (_, res) => {
  try {
    const purchasedCourse = await CoursePurchase.find({
      status: "completed",
    }).populate("courseId");
    if (!purchasedCourse) {
      return res.status(404).json({
        purchasedCourse: [],
      });
    }
    return res.status(200).json({
      purchasedCourse,
    });
  } catch (error) {
    console.log(error);
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
      if (!purchase)
        return res.status(404).json({ message: "Purchase not found" });

      purchase.status = "completed";
      await purchase.save();

      // Enroll logic
      await User.findByIdAndUpdate(purchase.userId, {
        $addToSet: { enrolledCourses: purchase.courseId },
      });

      await Course.findByIdAndUpdate(purchase.courseId, {
        $addToSet: { enrolledStudents: purchase.userId },
      });

      await Lecture.updateMany(
        { _id: { $in: (await Course.findById(purchase.courseId)).lectures } },
        { isPreviewFree: true }
      );

      return res
        .status(200)
        .json({ message: "Payment verified & course enrolled" });
    } else {
      return res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (err) {
    console.error("Esewa payment verify error", err);
    res.status(500).json({ message: "Error verifying eSewa payment" });
  }
};

export const verifyEsewaRedirect = async (req, res) => {
  try {
    const { oid, amt, refId } = req.query; // from esewa success redirect
    const { courseId, userId } = req.query;

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
      await CoursePurchase.findByIdAndUpdate(oid, {
        status: "completed",
        paymentId: refId,
      });

      await User.findByIdAndUpdate(userId, {
        $addToSet: { enrolledCourses: courseId },
      });

      return res.redirect(`http://localhost:5173/course-progress/${courseId}`);
    } else {
      return res.redirect(
        `http://localhost:5173/course-detail/${courseId}?error=payment_failed`
      );
    }
  } catch (error) {
    console.error("eSewa verification error:", error);
    return res.redirect(
      `http://localhost:5173/course-detail/${req.query.courseId}?error=server_error`
    );
  }
};
