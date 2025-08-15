import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const CourseProgress = () => {
  const { courseId } = useParams();
  const [currentLecture, setCurrentLecture] = useState(null);
  const [certificateUrl, setCertificateUrl] = useState(null);

  const { data, isLoading, isError, refetch } =
    useGetCourseProgressQuery(courseId);
  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [completeCourse, { isSuccess: completedSuccess }] =
    useCompleteCourseMutation();
  const [inCompleteCourse, { isSuccess: inCompletedSuccess }] =
    useInCompleteCourseMutation();

  const courseData = data?.data;
  const { courseDetails, progress, completed } = courseData || {};
  const initialLecture = currentLecture || courseDetails?.lectures?.[0];

  // Effect: on course complete/incomplete
  useEffect(() => {
    if (completedSuccess || inCompletedSuccess) {
      refetch();
      toast.success(
        `Course ${
          completedSuccess ? "marked as completed" : "set to incomplete"
        }`
      );
    }
  }, [completedSuccess, inCompletedSuccess]);

  // Effect: Fetch certificate if course completed
  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/v1/certificate/${courseId}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("Certificate not found");

        const data = await res.json();
        setCertificateUrl(data.url);
      } catch (err) {
        setCertificateUrl(null);
      }
    };


    if (completed) {
      fetchCertificate();
    }
  }, [courseId, completed]);

  const isLectureCompleted = (lectureId) =>
    progress?.some((prog) => prog.lectureId === lectureId && prog.viewed);

  const handleLectureProgress = async (lectureId) => {
    await updateLectureProgress({ courseId, lectureId });
    refetch();
  };

  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
    handleLectureProgress(lecture._id);
  };

  const handleCompleteCourse = async () => {
    const allCompleted = courseDetails.lectures.every((lec) =>
      progress.some((prog) => prog.lectureId === lec._id && prog.viewed)
    );

    if (!allCompleted) {
      toast.error(
        "Please complete all lectures before generating certificate."
      );
      return;
    }

    await completeCourse(courseId);
    await refetch();

    try {
      const res = await fetch(
        "http://localhost:8080/api/v1/certificate/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ courseId }),
        }
      );

      const result = await res.json();
      if (res.ok) {
        setCertificateUrl(result.url);
        toast.success("🎓 Certificate generated successfully!");
      } else {
        throw new Error(result.message || "Certificate error");
      }
    } catch (err) {
      console.error("Certificate generation failed:", err.message);
      toast.error("Certificate generation failed.");
    }
  };

  const handleInCompleteCourse = async () => {
    await inCompleteCourse(courseId);
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError || !courseDetails) return <p>Failed to load course details</p>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">{courseDetails.courseTitle}</h1>
        <Button
          onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
          variant={completed ? "outline" : "default"}
        >
          {completed ? (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" /> <span>Completed</span>
            </div>
          ) : (
            "Mark as completed"
          )}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 md:w-3/5 h-fit rounded-lg shadow-lg p-4">
          <video
            src={currentLecture?.videoUrl || initialLecture?.videoUrl || ""}
            controls
            className="w-full h-auto md:rounded-lg"
            onPlay={() =>
              handleLectureProgress(currentLecture?._id || initialLecture?._id)
            }
          />
          <div className="mt-2">
            <h3 className="font-medium text-lg">
              {`Lecture ${
                courseDetails.lectures.findIndex(
                  (lec) =>
                    lec._id === (currentLecture?._id || initialLecture?._id)
                ) + 1
              }: ${
                currentLecture?.lectureTitle || initialLecture?.lectureTitle
              }`}
            </h3>
          </div>

          {completed &&
            (certificateUrl ? (
              <a
                href={`http://localhost:8080${certificateUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded mt-4 inline-block"
              >
                🎓 Download Certificate
              </a>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                Generating certificate...
              </p>
            ))}
        </div>

        <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
          <h2 className="font-semibold text-xl mb-4">Course Lectures</h2>
          <div className="flex-1 overflow-y-auto">
            {courseDetails.lectures.map((lecture) => (
              <Card
                key={lecture._id}
                className={`mb-3 hover:cursor-pointer transition transform ${
                  lecture._id === currentLecture?._id
                    ? "bg-gray-200 dark:bg-gray-800"
                    : ""
                }`}
                onClick={() => handleSelectLecture(lecture)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center">
                    {isLectureCompleted(lecture._id) ? (
                      <CheckCircle2 size={24} className="text-green-500 mr-2" />
                    ) : (
                      <CirclePlay size={24} className="text-gray-500 mr-2" />
                    )}
                    <CardTitle className="text-lg font-medium">
                      {lecture.lectureTitle}
                    </CardTitle>
                  </div>
                  {isLectureCompleted(lecture._id) && (
                    <Badge
                      variant="outline"
                      className="bg-green-200 text-green-600"
                    >
                      Completed
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;
