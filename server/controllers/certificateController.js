// server/controllers/certificateController.js
import path from "path";
import { fileURLToPath } from "url";
import generateCertificatePDF from "../utils/generateCertificatePDF.js";
import Certificate from "../models/certificate.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { CourseProgress } from "../models/courseProgress.js";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 🎓 Generate certificate on course completion
export const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user._id;

    // Validate required data
    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    // Fetch all required data
    const course = await Course.findById(courseId).populate("creator");
    const student = await User.findById(studentId);
    const instructor = course?.creator;

    if (!student || !course || !instructor) {
      return res.status(404).json({ message: "Required data not found" });
    }

    // Verify course completion
    const courseProgress = await CourseProgress.findOne({
      courseId,
      userId: studentId,
    });

    if (!courseProgress || !courseProgress.completed) {
      return res.status(400).json({ message: "Course not fully completed" });
    }

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({
      course: courseId,
      student: studentId,
    });

    if (existingCert) {
      return res.status(200).json({
        message: "Certificate already exists",
        url: existingCert.fileUrl,
        certificateId: existingCert._id,
      });
    }

    // Create necessary directories
    const certificatesDir = path.join(__dirname, "../public/certificates");
    const templatesDir = path.join(__dirname, "../templates");

    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
      console.log("📁 Created certificates directory");
    }

    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
      console.log("📁 Created templates directory");
    }

    // Generate unique filename
    const fileName = `certificate_${studentId}_${courseId}_${Date.now()}.pdf`;
    const outputPath = path.join(certificatesDir, fileName);

    // Get completion date
    const completionDate = courseProgress.completedAt || new Date();

    // Generate PDF certificate
    await generateCertificatePDF({
      studentName: student.name,
      courseTitle: course.courseTitle, // Changed from course.title
      instructorName: instructor.name,
      completionDate,
      outputPath,
    });

    // Create certificate URL (accessible via static files)
    const certificateUrl = `/certificates/${fileName}`;

    // Save certificate record to database
    const cert = await Certificate.create({
      student: studentId,
      course: courseId,
      instructor: instructor._id,
      fileUrl: certificateUrl,
    });

    console.log("🎉 Certificate generated and saved:", fileName);

    res.status(200).json({
      message: "Certificate generated successfully! 🎓",
      url: certificateUrl,
      certificateId: cert._id,
      downloadUrl: `${req.protocol}://${req.get("host")}${certificateUrl}`,
    });
  } catch (error) {
    console.error("Certificate generation error:", error);
    res.status(500).json({
      message: error.message || "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const getCertificateByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    // 1️⃣ Check if course is completed
    const courseProgress = await CourseProgress.findOne({
      courseId,
      userId: studentId,
    });

    if (!courseProgress || !courseProgress.completed) {
      return res.status(404).json({
        message: "Certificate not available - course not completed",
        completed: false,
      });
    }

    // 2️⃣ Check if certificate already exists
    let certificate = await Certificate.findOne({
      course: courseId,
      student: studentId,
    });

    if (!certificate) {
      // 3️⃣ Fetch course, student, instructor info
      const course = await Course.findById(courseId).populate("creator");
      const student = await User.findById(studentId);
      const instructor = course?.creator;

      if (!student || !course || !instructor) {
        return res.status(404).json({ message: "Required data not found" });
      }

      // 4️⃣ Create directories if missing
      const certificatesDir = path.join(__dirname, "../public/certificates");
      if (!fs.existsSync(certificatesDir)) {
        fs.mkdirSync(certificatesDir, { recursive: true });
        console.log("📁 Created certificates directory");
      }

      // 5️⃣ Generate unique filename & output path
      const fileName = `certificate_${studentId}_${courseId}_${Date.now()}.pdf`;
      const outputPath = path.join(certificatesDir, fileName);

      const completionDate = courseProgress.completedAt || new Date();

      // 6️⃣ Generate the PDF
      await generateCertificatePDF({
        studentName: student.name,
        courseTitle: course.courseTitle,
        instructorName: instructor.name,
        completionDate,
        outputPath,
      });

      // 7️⃣ Save certificate record to DB
      const certificateUrl = `/certificates/${fileName}`;
      certificate = await Certificate.create({
        student: studentId,
        course: courseId,
        instructor: instructor._id,
        fileUrl: certificateUrl,
      });

      console.log("🎉 Certificate generated and saved:", fileName);
    }

    // 8️⃣ Return certificate info
    res.status(200).json({
      message: "Certificate found",
      url: certificate.fileUrl,
      certificateId: certificate._id,
      downloadUrl: `${req.protocol}://${req.get("host")}${certificate.fileUrl}`,
    });
  } catch (error) {
    console.error("Error fetching/generating certificate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
