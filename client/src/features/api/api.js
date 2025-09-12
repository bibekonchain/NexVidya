// src/utils/api.js
import axios from "axios";

console.log("🚀 VITE_API_URL at runtime:", import.meta.env.VITE_API_URL);

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  withCredentials: true,
});

console.log("✅ Axios Base URL:", API.defaults.baseURL);

// Get recommended courses
export const getRecommendedCourses = async (userId) => {
  try {
    const res = await API.get(`/recommendations/${userId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    return [];
  }
};

export default API;
