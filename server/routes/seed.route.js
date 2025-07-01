// // routes/seed.route.js
// import express from "express";
// import { User } from "../models/user.model.js";
// import bcrypt from "bcryptjs";

// const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const adminExists = await User.findOne({ email: "admin@nexvidya.com" });
//     if (adminExists) {
//       return res
//         .status(200)
//         .json({ success: true, message: "Admin already exists" });
//     }

//     const hashedPassword = await bcrypt.hash("Admin@123", 10);
//     await User.create({
//       name: "Admin",
//       email: "admin@nexvidya.com",
//       password: hashedPassword,
//       role: "admin",
//     });

//     res
//       .status(201)
//       .json({ success: true, message: "Admin created successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Seeding failed" });
//   }
// });

// export default router;
