import React from "react";
import Course from "./Course";
import { useLoadUserQuery } from "@/features/api/authApi";
import RecommendedCourses from "./RecommendedCourses";

const MyLearning = () => {
  const { data, isLoading } = useLoadUserQuery();

  // Get user directly from the query response instead of Redux
  const user = data?.user;
  const myLearning = user?.enrolledCourses || [];

  console.log("User data:", user); // Debug log
  console.log("User ID:", user?._id); // Debug log

  return (
    <div className="max-w-4xl mx-auto my-10 px-4 md:px-0">
      <h1 className="font-bold text-2xl">MY LEARNING</h1>
      <div className="my-5">
        {isLoading ? (
          <MyLearningSkeleton />
        ) : myLearning.length === 0 ? (
          <p>You are not enrolled in any course.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {myLearning.map((course, index) => (
              <Course key={course._id || index} course={course} />
            ))}
          </div>
        )}
      </div>

      {/* Only show recommendations when user is loaded */}
      {!isLoading && user?._id && (
        <div>
          <h1 className="font-bold text-2xl">Recommended Course</h1>
          <RecommendedCourses userId={user._id} />
        </div>
      )}
    </div>
  );
};

export default MyLearning;

// Skeleton component for loading state
const MyLearningSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {[...Array(3)].map((_, index) => (
      <div
        key={index}
        className="bg-gray-300 dark:bg-gray-700 rounded-lg h-40 animate-pulse"
      ></div>
    ))}
  </div>
);
