// controllers/admin.controller.js
import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { CourseProgress } from "../models/courseProgress.js";

// GET /admin/users
export const getAllUsers = async (_, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("enrolledCourses");
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

// GET /admin/users/:userId
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .select("-password")
      .populate("enrolledCourses");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const purchases = await CoursePurchase.find({ userId }).populate(
      "courseId"
    );
    const progress = await CourseProgress.find({ userId }).populate("courseId");

    res.status(200).json({ success: true, user, purchases, progress });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching user details" });
  }
};

// GET /admin/stats
export const getAdminStats = async (_, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInstructors = await User.countDocuments({ role: "instructor" });
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalCourses = await Course.countDocuments();
    const purchases = await CoursePurchase.find({ status: "completed" });

    const totalRevenue = purchases.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalSales = purchases.length;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalInstructors,
        totalStudents,
        totalCourses,
        totalSales,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching stats" });
  }
};


// PUT /admin/users/:userId
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["student", "instructor", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user,
    });
  } catch (error) {
    console.error("Update role error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update user role" });
  }
};

// GET /admin/instructor-requests
export const getInstructorRequests = async (req, res) => {
  try {
   const requests = await User.find({
     requestedInstructor: true,
     role: "student",
   }).select("name email role photoUrl instructorRequest createdAt");


    res.status(200).json({ success: true, users: requests });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching instructor requests" });
  }
};
