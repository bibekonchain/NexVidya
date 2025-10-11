import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import adminRoutes from "./routes/admin.route.js";
import path from "path";
import { fileURLToPath } from "url";
import certificateRoute from "./routes/certificate.route.js";
import recommendationRoute from "./routes/recommendation.route.js";
// import seedRoute from "./routes/seed.route.js";

dotenv.config();

// ✅ Disable console logs ONLY in production
if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
  // keep console.error if you still want to see errors in prod
  // or disable it too if you want complete silence:
  // console.error = () => {};
}

// call database connection here
connectDB();
const app = express();

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/api/v1/purchase/webhook", express.raw({ type: "application/json" }));

// default middleware
app.use(express.json());
app.use(cookieParser());

// Serve static certificate files
app.use(
  "/certificates",
  express.static(path.join(__dirname, "public/certificates"))
);

// ✅ Use env vars for CORS
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  })
);

// apis
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/certificate", certificateRoute);
app.use("/uploads/certificates", express.static("uploads/certificates"));
app.use("/api/v1/recommendations", recommendationRoute);

// app.use("/api/v1/seed", seedRoute);

app.listen(PORT, () => {
  console.log(
    `✅ Server running at ${
      process.env.BACKEND_URL || `http://localhost:${PORT}`
    }`
  );
});
