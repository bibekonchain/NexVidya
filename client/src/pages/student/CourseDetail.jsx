import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { BadgeInfo, Lock, PlayCircle } from "lucide-react";
import ReactPlayer from "react-player";
import { useNavigate, useParams } from "react-router-dom";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const { data, isLoading, isError } =
    useGetCourseDetailWithStatusQuery(courseId);

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>Failed to load course details</h1>;

  const { course, purchased } = data;
  console.log(purchased);

  console.log("API data:", data);
  console.log("course.lectures isArray?", Array.isArray(course?.lectures));
  console.log("lectures length:", course?.lectures?.length);
  console.log("lectures keys:", Object.keys(course?.lectures || {}));
  console.log("first lecture:", course?.lectures?.[0]);
  console.log("Lectures from API:", course?.lectures);
  console.log("Lectures length:", course?.lectures?.length);

  const handleContinueCourse = () => {
    if (purchased) {
      navigate(`/course-progress/${courseId}`);
    }
  };

  // Check if lecture is accessible (purchased or free preview)
  const isLectureAccessible = (lecture) => {
    return purchased || lecture.isPreviewFree;
  };

  // Find the first accessible lecture for video preview
  const getPreviewLecture = () => {
    if (purchased) {
      return course.lectures[0]; // Show first lecture for purchased users
    }
    // For non-purchased users, find first free preview lecture
    return course.lectures.find((lecture) => lecture.isPreviewFree) || null;
  };

  const previewLecture = getPreviewLecture();
  return (
    <div className="space-y-5">
      <div className="bg-[#2D2F31] text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2">
          <h1 className="font-bold text-2xl md:text-3xl">
            {course?.courseTitle}
          </h1>
          <p className="text-base md:text-lg">Course Sub-title</p>
          <p>
            Created By{" "}
            <span className="text-[#C0C4FC] underline italic">
              {course?.creator.name}
            </span>
          </p>
          <div className="flex items-center gap-2 text-sm">
            <BadgeInfo size={16} />
            <p>Last updated {course?.createdAt.split("T")[0]}</p>
          </div>
          <p>Students enrolled: {course?.enrolledStudents.length}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10">
        <div className="w-full lg:w-1/2 space-y-5">
          <h1 className="font-bold text-xl md:text-2xl">Description</h1>
          <p
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: course.description }}
          />
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                {course.lectures.length} lectures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.lectures.map((lecture, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <span>
                    {isLectureAccessible(lecture) ? (
                      <PlayCircle size={14} />
                    ) : (
                      <Lock size={14} />
                    )}
                  </span>
                  <p
                    className={
                      !isLectureAccessible(lecture) ? "opacity-60" : ""
                    }
                  >
                    {lecture.lectureTitle}
                    {!purchased && lecture.isPreviewFree && (
                      <span className="text-green-600 text-xs ml-2">
                        (Free Preview)
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-1/3">
          <Card>
            <CardContent className="p-4 flex flex-col">
              {previewLecture ? (
                <div className="w-full aspect-video mb-4">
                  <ReactPlayer
                    width="100%"
                    height={"100%"}
                    url={previewLecture.videoUrl}
                    controls={true}
                  />
                </div>
              ) : (
                <div className="w-full aspect-video mb-4 bg-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <Lock size={32} className="mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-600">No preview available</p>
                    <p className="text-sm text-gray-500">
                      Purchase course to access content
                    </p>
                  </div>
                </div>
              )}
              <h1>
                {previewLecture
                  ? previewLecture.lectureTitle
                  : "Course Preview"}
              </h1>
              <Separator className="my-2" />
              <h1 className="text-lg md:text-xl font-semibold">Course Price</h1>
            </CardContent>
            <CardFooter className="flex justify-center p-4">
              {purchased ? (
                <Button onClick={handleContinueCourse} className="w-full">
                  Continue Course
                </Button>
              ) : (
                <BuyCourseButton courseId={courseId} />
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
