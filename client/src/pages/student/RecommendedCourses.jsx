import React, { useEffect, useState } from "react";
import { getRecommendedCourses } from "@/features/api/api";
import Course from "./Course"; // reuse your existing Course card component

const RecommendedCourses = ({ userId }) => {
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const data = await getRecommendedCourses(userId);
      setRecommended(data);
    };
    if (userId) fetchRecommendations();
  }, [userId]);

  if (!recommended.length) return null;

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">Recommended For You</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommended.map((course) => (
          <Course key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedCourses;
