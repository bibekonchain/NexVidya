import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createCourse,
  createLecture,
  editCourse,
  editLecture,
  getCourseById,
  getCourseLecture,
  getCreatorCourses,
  getLectureById,
  getPublishedCourse,
  removeLecture,
  searchCourse,
  togglePublishCourse,
} from "../controllers/course.controller.js";
import upload from "../utils/multer.js";

const router = express.Router();

// ==================== Lecture Routes (More Specific First) ====================

// Create or Get Lectures of a Course
router
  .route("/:courseId/lecture")
  .post(isAuthenticated, upload.single("videoFile"), createLecture)
  .get(isAuthenticated, getCourseLecture);

// Edit a Lecture inside a Course
router
  .route("/:courseId/lecture/:lectureId")
  .post(isAuthenticated, editLecture);

// Get/Delete Single Lecture (Independent of Course)
router
  .route("/lecture/:lectureId")
  .get(isAuthenticated, getLectureById)
  .delete(isAuthenticated, removeLecture);

// ==================== Course Routes ====================

// Create Course / Get All Creator Courses
router
  .route("/")
  .post(isAuthenticated, createCourse)
  .get(isAuthenticated, getCreatorCourses);

// Search & Published Courses (No Auth Required for Published)
router.route("/search").get(isAuthenticated, searchCourse);
router.route("/published-courses").get(getPublishedCourse);

// Get / Edit / Publish Course by ID
router
  .route("/:courseId")
  .get(isAuthenticated, getCourseById)
  .put(isAuthenticated, upload.single("courseThumbnail"), editCourse)
  .patch(isAuthenticated, togglePublishCourse);

export default router;
