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
// import seedRoute from "./routes/seed.route.js";

dotenv.config({});

// call database connection here
connectDB();
const app = express();

const PORT = process.env.PORT || 3000;



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// default middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
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
app.use("/certificates", express.static(path.join(__dirname, "certificates")));
app.use("/api/v1/certificate", certificateRoute);
app.use("/uploads/certificates", express.static("uploads/certificates"));


// app.use("/api/v1/seed", seedRoute);

app.listen(PORT, () => {
  console.log(`Server listen at port ${PORT}`);
});
