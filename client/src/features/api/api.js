// src/utils/api.js
import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  withCredentials: true,
});

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
