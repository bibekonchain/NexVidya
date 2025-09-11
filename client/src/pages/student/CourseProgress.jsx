import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import {
  CheckCircle,
  CheckCircle2,
  CirclePlay,
  Download,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const CourseProgress = () => {
  const { courseId } = useParams();
  const [currentLecture, setCurrentLecture] = useState(null);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [certificateError, setCertificateError] = useState(null);

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
      if (!completed) {
        setCertificateUrl(null);
        setCertificateError(null);
        return;
      }

      try {
        setCertificateError(null);
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/certificate/${courseId}`,
          { credentials: "include" }
        );

        if (res.status === 404) {
          // Certificate doesn't exist yet - this is normal for newly completed courses
          setCertificateUrl(null);
          setCertificateError(null);
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setCertificateUrl(data.url);
      } catch (err) {
        console.error("Error fetching certificate:", err);
        setCertificateUrl(null);
        setCertificateError(err.message);
      }
    };

    fetchCertificate();
  }, [courseId, completed]);

  const isLectureCompleted = (lectureId) =>
    progress?.some((prog) => prog.lectureId === lectureId && prog.viewed);

  const handleLectureProgress = async (lectureId) => {
    try {
      await updateLectureProgress({ courseId, lectureId });
      refetch();
    } catch (error) {
      console.error("Error updating lecture progress:", error);
      toast.error("Failed to update lecture progress");
    }
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

    setIsGeneratingCertificate(true);

    try {
      // Mark course as completed
      await completeCourse(courseId);
      await refetch();

      // Generate certificate
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/certificate/generate`,
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
        setCertificateError(null);
        toast.success("🎓 Certificate generated successfully!");
      } else {
        throw new Error(result.message || "Certificate generation failed");
      }
    } catch (err) {
      console.error("Certificate generation failed:", err);
      setCertificateError(err.message);
      toast.error(`Certificate generation failed: ${err.message}`);
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  const handleInCompleteCourse = async () => {
    try {
      await inCompleteCourse(courseId);
      // Clear certificate when marking as incomplete
      setCertificateUrl(null);
      setCertificateError(null);
    } catch (error) {
      console.error("Error marking course as incomplete:", error);
      toast.error("Failed to mark course as incomplete");
    }
  };

  const handleDownloadCertificate = () => {
    if (certificateUrl) {
      window.open(`${import.meta.env.VITE_API_URL}${certificateUrl}`, "_blank");
    }
  };

  const allLecturesCompleted =
    courseDetails?.lectures?.every((lec) =>
      progress?.some((prog) => prog.lectureId === lec._id && prog.viewed)
    ) || false;

  if (isLoading) return <p>Loading...</p>;
  if (isError || !courseDetails) return <p>Failed to load course details</p>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">{courseDetails.courseTitle}</h1>
        <Button
          onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
          variant={completed ? "outline" : "default"}
          disabled={
            isGeneratingCertificate || (!completed && !allLecturesCompleted)
          }
        >
          {isGeneratingCertificate ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>Generating...</span>
            </div>
          ) : completed ? (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>Completed</span>
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

          {/* Certificate Section */}
          {completed && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              {certificateUrl ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">
                      Certificate Ready!
                    </span>
                  </div>
                  <Button
                    onClick={handleDownloadCertificate}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate
                  </Button>
                </div>
              ) : certificateError ? (
                <div className="flex items-center justify-between">
                  <span className="text-red-600 text-sm">
                    Certificate Error: {certificateError}
                  </span>
                  <Button
                    onClick={handleCompleteCourse}
                    variant="outline"
                    size="sm"
                    disabled={isGeneratingCertificate}
                  >
                    {isGeneratingCertificate ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Retry...
                      </>
                    ) : (
                      "Retry Generate"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="text-gray-600 text-sm">
                    Preparing certificate...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
          <h2 className="font-semibold text-xl mb-4">Course Lectures</h2>

          {/* Progress Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">
                {progress?.filter((p) => p.viewed).length || 0} /{" "}
                {courseDetails.lectures.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((progress?.filter((p) => p.viewed).length || 0) /
                      courseDetails.lectures.length) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {courseDetails.lectures.map((lecture, index) => (
              <Card
                key={lecture._id}
                className={`mb-3 hover:cursor-pointer transition transform hover:shadow-md ${
                  lecture._id === currentLecture?._id
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleSelectLecture(lecture)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center">
                    {isLectureCompleted(lecture._id) ? (
                      <CheckCircle2
                        size={24}
                        className="text-green-500 mr-3 flex-shrink-0"
                      />
                    ) : (
                      <CirclePlay
                        size={24}
                        className="text-gray-400 mr-3 flex-shrink-0"
                      />
                    )}
                    <div>
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Lecture {index + 1}
                      </CardTitle>
                      <p className="text-base font-medium">
                        {lecture.lectureTitle}
                      </p>
                    </div>
                  </div>
                  {isLectureCompleted(lecture._id) && (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-700 border-green-300"
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
