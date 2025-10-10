import React, { useEffect, useState } from "react";
import { getRecommendedCourses } from "@/features/api/api";
import Course from "./Course";

const RecommendedCourses = ({ userId }) => {
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userId) {
        console.log("No userId provided");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("Fetching recommendations for userId:", userId);
        const data = await getRecommendedCourses(userId);
        console.log("Recommendations received:", data);

        // Ensure data is an array
        if (Array.isArray(data)) {
          setRecommended(data);
        } else {
          console.warn("Unexpected data format:", data);
          setRecommended([]);
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError(err.message);
        setRecommended([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]);

  // Show loading state
  if (loading) {
    return (
      <div className="my-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-300 dark:bg-gray-700 rounded-lg h-40 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Show error if any
  if (error) {
    return (
      <div className="my-8">
        <p className="text-red-500">Error loading recommendations: {error}</p>
      </div>
    );
  }

  // Don't render if no recommendations
  if (!recommended.length) {
    return (
      <div className="my-8">
        <p className="text-gray-500">No recommendations available yet.</p>
      </div>
    );
  }

  return (
    <div className="my-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommended.map((course) => (
          <Course key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedCourses;
