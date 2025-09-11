import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  BookOpen,
  Trophy,
  Clock,
  Play,
  CheckCircle2,
  Award,
  TrendingUp,
  Users,
  GraduationCap,
  Calendar,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import Course from "./Course";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
} from "@/features/api/authApi";
import { toast } from "sonner";
import InstructorRequest from "../student/InstructorRequest";

const Profile = () => {
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [courseProgress, setCourseProgress] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [learningStats, setLearningStats] = useState({});

  const { data, isLoading, refetch } = useLoadUserQuery();

  const [
    updateUser,
    {
      data: updateUserData,
      isLoading: updateUserIsLoading,
      isError,
      error,
      isSuccess,
    },
  ] = useUpdateUserMutation();

  useEffect(() => {
    refetch();
    fetchUserProgress();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(updateUserData?.message || "Profile updated.");
    }
    if (isError) {
      toast.error(error?.message || "Failed to update profile");
    }
  }, [error, updateUserData, isSuccess, isError]);

  // Fetch detailed course progress
  const fetchUserProgress = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/progress/user`,
        { credentials: "include" }
      );

      const data = await response.json();
      setCourseProgress(data.data || []); // depends on your backend response shape
    } catch (error) {
      console.error("Failed to fetch progress:", error);
    }
  };

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfilePhoto(file);
  };

  const updateUserHandler = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("profilePhoto", profilePhoto);
    await updateUser(formData);
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!courseProgress.length) return 0;
    const totalProgress = courseProgress.reduce((sum, course) => {
      const completed =
        course.lectureProgress?.filter((l) => l.viewed).length || 0;
      const total = course.lectureProgress?.length || 1;
      return sum + completed / total;
    }, 0);
    return Math.round((totalProgress / courseProgress.length) * 100);
  };

  // Get recent activity
  const getRecentActivity = () => {
    return courseProgress
      .filter((course) => course.lastAccessed)
      .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
      .slice(0, 5);
  };

  if (isLoading) return <h1 className="p-4">Profile Loading...</h1>;

  const user = data?.user;
  if (!user) return <h1 className="p-4">User not found or not loaded.</h1>;

  const overallProgress = calculateOverallProgress();
  const completedCourses = courseProgress.filter((c) => c.completed).length;
  const totalEnrolled = user.enrolledCourses?.length || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 my-10">
      <h1 className="font-bold text-3xl text-center md:text-left mb-8">
        PROFILE
      </h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* User Profile Section */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 mb-4">
                <AvatarImage
                  src={user?.photoUrl || "https://github.com/shadcn.png"}
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Badge variant="secondary" className="mt-2">
                {user.role?.toUpperCase()}
              </Badge>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Name:
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {user.name}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Email:
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {user.email}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Joined:
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Overall Progress:
                  </h3>
                  <div className="flex items-center gap-2">
                    <Progress value={overallProgress} className="flex-1" />
                    <span className="text-sm font-medium">
                      {overallProgress}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <InstructorRequest />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">Edit Profile</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when
                        you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label>Name</Label>
                        <Input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Name"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label>Profile Photo</Label>
                        <Input
                          onChange={onChangeHandler}
                          type="file"
                          accept="image/*"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        disabled={updateUserIsLoading}
                        onClick={updateUserHandler}
                      >
                        {updateUserIsLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                            Please wait
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Learning Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Enrolled Courses
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEnrolled}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {completedCourses}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Hours
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {learningStats.totalHours || 0}h
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Streak</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {learningStats.streak || 0} days
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enrolled Courses */}
          <div>
            <h2 className="font-medium text-xl mb-4">Your Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {totalEnrolled === 0 ? (
                <p className="col-span-full text-center text-gray-500 py-8">
                  You haven't enrolled in any courses yet
                </p>
              ) : (
                user.enrolledCourses?.map((course) => (
                  <Course course={course} key={course._id} />
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {/* Detailed Progress Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Detailed Course Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {courseProgress.length > 0 ? (
                <div className="space-y-4">
                  {courseProgress.map((course) => {
                    const completed =
                      course.lectureProgress?.filter((l) => l.viewed).length ||
                      0;
                    const total = course.lectureProgress?.length || 1;
                    const progressPercent = Math.round(
                      (completed / total) * 100
                    );

                    return (
                      <div key={course._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">
                              {course.courseDetails?.title || "Unknown Course"}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {completed} of {total} lectures completed
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {course.completed && (
                              <Badge variant="default" className="bg-green-600">
                                <Trophy className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Progress
                            value={progressPercent}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium">
                            {progressPercent}%
                          </span>
                        </div>

                        {/* Lecture Progress Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {course.lectureProgress?.map((lecture, index) => (
                            <div
                              key={lecture.lectureId}
                              className={`flex items-center gap-2 text-xs p-2 rounded ${
                                lecture.viewed
                                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {lecture.viewed ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                              Lecture {index + 1}
                            </div>
                          ))}
                        </div>

                        {!course.completed && (
                          <Button
                            size="sm"
                            className="mt-3"
                            onClick={() =>
                              (window.location.href = `/course-study/${course.courseId}`)
                            }
                          >
                            Continue Learning
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No course progress to display</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {/* Achievements Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements & Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Default achievements based on progress */}
                {completedCourses >= 1 && (
                  <div className="text-center p-4 border rounded-lg">
                    <Trophy className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                    <h4 className="font-medium">First Course</h4>
                    <p className="text-xs text-gray-600">
                      Completed your first course
                    </p>
                  </div>
                )}

                {completedCourses >= 5 && (
                  <div className="text-center p-4 border rounded-lg">
                    <GraduationCap className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <h4 className="font-medium">Dedicated Learner</h4>
                    <p className="text-xs text-gray-600">Completed 5 courses</p>
                  </div>
                )}

                {overallProgress >= 80 && (
                  <div className="text-center p-4 border rounded-lg">
                    <Target className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <h4 className="font-medium">High Achiever</h4>
                    <p className="text-xs text-gray-600">
                      80%+ overall progress
                    </p>
                  </div>
                )}

                {(learningStats.streak || 0) >= 7 && (
                  <div className="text-center p-4 border rounded-lg">
                    <Calendar className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                    <h4 className="font-medium">Consistent</h4>
                    <p className="text-xs text-gray-600">
                      7 day learning streak
                    </p>
                  </div>
                )}

                {/* Custom achievements from API */}
                {achievements.map((achievement) => (
                  <div
                    key={achievement._id}
                    className="text-center p-4 border rounded-lg"
                  >
                    <Award className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                    <h4 className="font-medium">{achievement.title}</h4>
                    <p className="text-xs text-gray-600">
                      {achievement.description}
                    </p>
                  </div>
                ))}

                {completedCourses === 0 && achievements.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      Complete courses to earn achievements!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Learning Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getRecentActivity().length > 0 ? (
                <div className="space-y-4">
                  {getRecentActivity().map((activity) => (
                    <div
                      key={activity._id}
                      className="flex items-center gap-4 p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {activity.courseDetails?.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Last accessed:{" "}
                          {new Date(activity.lastAccessed).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {activity.lectureProgress?.filter((l) => l.viewed)
                            .length || 0}
                          /{activity.lectureProgress?.length || 0} lectures
                        </p>
                        {activity.completed && (
                          <Badge
                            variant="default"
                            className="bg-green-600 mt-1"
                          >
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Learning Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Learning Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span>Complete {totalEnrolled} enrolled courses</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={
                        (completedCourses / Math.max(totalEnrolled, 1)) * 100
                      }
                      className="w-20"
                    />
                    <span className="text-sm">
                      {completedCourses}/{totalEnrolled}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span>Maintain 7-day learning streak</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={Math.min(
                        ((learningStats.streak || 0) / 7) * 100,
                        100
                      )}
                      className="w-20"
                    />
                    <span className="text-sm">
                      {learningStats.streak || 0}/7 days
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span>Achieve 100% overall progress</span>
                  <div className="flex items-center gap-2">
                    <Progress value={overallProgress} className="w-20" />
                    <span className="text-sm">{overallProgress}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
