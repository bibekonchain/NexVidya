import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const InstructorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_URL}/api/v1/admin/instructor-requests`,
        {
          withCredentials: true,
        }
      );
      setRequests(data.users);
    } catch (err) {
      toast.error("Failed to load instructor requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setApprovingId(userId);
      await axios.put(
        `${API_URL}/api/v1/admin/update-role/${userId}`,
        { role: "instructor" },
        {
          withCredentials: true,
        }
      );
      toast.success("Instructor approved.");
      setRequests((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      toast.error("Failed to approve instructor.");
    } finally {
      setApprovingId(null);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Instructor Requests</h1>
      {requests.length === 0 ? (
        <p>No instructor requests available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((user) => (
            <Card key={user._id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={user.photoUrl} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {user.instructorRequest?.fullName || user.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      Requested At:{" "}
                      {new Date(
                        user.instructorRequest?.requestedAt || user.updatedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-3 text-sm">
                  <p>
                    <strong>Experience:</strong>{" "}
                    {user.instructorRequest?.experience} years
                  </p>
                  <p>
                    <strong>Expertise:</strong>{" "}
                    {user.instructorRequest?.subjectExpertise}
                  </p>
                  <p>
                    <strong>Demo Video:</strong>{" "}
                    <a
                      href={user.instructorRequest?.demoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Watch
                    </a>
                  </p>
                  {user.instructorRequest?.documents && (
                    <p>
                      <strong>Document:</strong>{" "}
                      <a
                        href={user.instructorRequest?.documents}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View PDF
                      </a>
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorRequests;
