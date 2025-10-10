import { Course } from "../models/course.model.js";
import { cosineSimilarity } from "../utils/recommendation.js";

export const getCourseRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find user's enrolled courses and populate lectures
    const userCourses = await Course.find({
      enrolledStudents: userId,
    }).populate("lectures");

    console.log("User enrolled courses:", userCourses.length);

    if (!userCourses.length) {
      return res.json([]);
    }

    // Collect all learned "skills" from lecture titles
    const userSkills = userCourses.flatMap((course) =>
      course.lectures.map((l) => l.lectureTitle)
    );

    console.log("User skills (lecture titles):", userSkills);

    // Find all other courses not enrolled by user
    const allCourses = await Course.find({
      _id: { $nin: userCourses.map((c) => c._id) },
      isPublished: true, // Only recommend published courses
    }).populate("lectures");

    console.log("Available courses for recommendation:", allCourses.length);

    if (!allCourses.length) {
      return res.json([]);
    }

    // Calculate similarity scores
    const recommendations = allCourses.map((course) => {
      const courseSkills = course.lectures.map((l) => l.lectureTitle);
      const similarityScore = cosineSimilarity(courseSkills, userSkills);

      console.log(
        `Course: ${course.courseTitle}, Similarity: ${similarityScore}%`
      );

      return { ...course.toObject(), similarityScore };
    });

    // Sort by similarity - REMOVED THE FILTER TO SHOW ALL COURSES
    // Even with 0 similarity, show courses (can be changed later)
    const sorted = recommendations
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 6); // Limit to top 6

    console.log("Recommendations found:", sorted.length);

    res.json(sorted);
  } catch (error) {
    console.error("Recommendation Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
