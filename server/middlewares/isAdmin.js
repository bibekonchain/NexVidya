// middlewares/isAdmin.js
import { User } from "../models/user.model.js";

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Admin check failed" });
  }
};

export default isAdmin;
