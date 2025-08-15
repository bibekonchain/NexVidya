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
// 🎓 Generate certificate on course completion
// 🎓 Generate certificate on course completion
export const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user._id;

    const course = await Course.findById(courseId).populate("creator");
    const student = await User.findById(studentId);
    const instructor = course?.creator;

    if (!student || !course || !instructor) {
      return res.status(404).json({ message: "Data not found" });
    }

    // ✅ Use CourseProgress model to verify completion
    const courseProgress = await CourseProgress.findOne({
      courseId,
      userId: studentId,
    });

    if (!courseProgress || !courseProgress.completed) {
      return res.status(400).json({ message: "Course not fully completed" });
    }

    // ✅ Check if certificate already exists
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

    const fileName = `certificate_${studentId}_${courseId}.pdf`;
    const outputPath = path.join(__dirname, "../certificates", fileName);

    // Create certificates directory if it doesn't exist
    const certificatesDir = path.join(__dirname, "../certificates");
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    // Create assets directory if it doesn't exist
    const assetsDir = path.join(__dirname, "../assets");
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    // Get completion date
    const completionDate = courseProgress.completedAt || new Date();

    await generateCertificatePDF({
      studentName: student.name,
      courseTitle: course.title,
      instructorName: instructor.name,
      completionDate,
      outputPath,
    });

    const certificateUrl = `/certificates/${fileName}`;

    const cert = await Certificate.create({
      student: studentId,
      course: courseId,
      instructor: instructor._id,
      fileUrl: certificateUrl,
    });

    res.status(200).json({
      message: "Certificate generated successfully! 🎓",
      url: certificateUrl,
      certificateId: cert._id,
    });
  } catch (error) {
    console.error("Certificate generation error:", error);
    res.status(500).json({ 
      message: error.message || "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// At the bottom of certificateController.js (or wherever appropriate)
export const getCertificateByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const certificate = await Certificate.findOne({
      course: courseId,
      student: studentId,
    });

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.status(200).json({
      message: "Certificate found",
      url: certificate.fileUrl,
      certificateId: certificate._id,
    });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
