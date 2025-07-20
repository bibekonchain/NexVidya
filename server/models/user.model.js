import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["instructor", "student", "admin"],
      default: "student",
    },
    requestedInstructor: {
  type: Boolean,
  default: false,
},
 instructorRequest: {
      fullName: String,
      experience: Number,
      subjectExpertise: String,
      demoLink: String,
      documents: String,
      requestedAt: Date,
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    photoUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);