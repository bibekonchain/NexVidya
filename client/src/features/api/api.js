// src/utils/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api/v1", // match your backend port
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
