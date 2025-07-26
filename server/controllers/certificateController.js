import path from "path";
import { fileURLToPath } from "url";
import generateCertificatePDF from "../utils/generateCertificatePDF.js";
import Certificate from "../models/certificate.model.js";
import Course from "../models/course.model.js";
import User from "../models/user.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user._id;

    const course = await Course.findById(courseId).populate("instructor");
    const student = await User.findById(studentId);
    const instructor = course.instructor;

    // Validate progress - ensure course is completed
    if (!student || !course || !instructor) {
      return res.status(404).json({ message: "Data not found" });
    }

    const completedLessons = student.courseProgress?.[courseId] || [];
    const totalLessons = course?.videos?.length || 0;

    if (completedLessons.length < totalLessons) {
      return res.status(400).json({ message: "Course not fully completed" });
    }

    const fileName = `certificate_${studentId}_${courseId}.pdf`;
    const outputPath = path.join(__dirname, "../certificates", fileName);

    await generateCertificatePDF({
      studentName: student.name,
      courseTitle: course.title,
      instructorName: instructor.name,
      date: new Date(),
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
      message: "Certificate generated",
      url: certificateUrl,
      certificateId: cert._id,
    });
  } catch (error) {
    console.error("Certificate generation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
