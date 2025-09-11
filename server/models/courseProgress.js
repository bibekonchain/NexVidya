import mongoose from "mongoose";

const lectureProgressSchema = new mongoose.Schema({
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",   // Proper reference
    required: true,
  },
  viewed: { type: Boolean, default: false },
});

const courseProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // Fix: should link to User collection
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Fix: should link to Course collection
      required: true,
    },
    completed: { type: Boolean, default: false },
    lectureProgress: [lectureProgressSchema],
  },
  { timestamps: true }
);

export const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);
