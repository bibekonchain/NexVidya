import { Course } from "../models/course.model.js";
import { cosineSimilarity } from "../utils/recommendation.js";

// Recommend courses based on watched/enrolled lectures
export const getCourseRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find user’s enrolled courses and populate lectures
    const userCourses = await Course.find({
      enrolledStudents: userId,
    }).populate("lectures");

    if (!userCourses.length) {
      return res.json({ message: "User not enrolled in any courses yet" });
    }

    // Collect all learned "skills" from lecture titles
    const userSkills = userCourses.flatMap((course) =>
      course.lectures.map((l) => l.lectureTitle)
    );

    // Find all other courses not enrolled by user
    const allCourses = await Course.find({
      _id: { $nin: userCourses.map((c) => c._id) },
    }).populate("lectures");

    // Calculate similarity scores
    const recommendations = allCourses.map((course) => {
      const courseSkills = course.lectures.map((l) => l.lectureTitle);
      const similarityScore = cosineSimilarity(courseSkills, userSkills);

      return { ...course.toObject(), similarityScore };
    });

    // Sort and filter
    const sorted = recommendations
      .filter((c) => c.similarityScore > 0)
      .sort((a, b) => b.similarityScore - a.similarityScore);

    res.json(sorted);
  } catch (error) {
    console.error("Recommendation Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
