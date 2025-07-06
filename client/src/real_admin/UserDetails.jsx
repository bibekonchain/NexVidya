import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import toast, { Toaster } from "react-hot-toast";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [progress, setProgress] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // ✅ Fetch user details
  useEffect(() => {
    axios
      .get(`/api/v1/admin/users/${id}`, { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
        setPurchases(res.data.purchases);
        setProgress(res.data.progress);
      })
      .catch((err) => {
        console.error("Failed to load user details:", err);
        toast.error("Failed to load user details");
      });
  }, [id]);

  // ✅ Sync selectedRole when user loads
  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  // ✅ Handle role update
  const handleRoleChange = async () => {
    setIsUpdating(true);
    try {
      await axios.put(
        `/api/v1/admin/users/${id}`,
        { role: selectedRole },
        { withCredentials: true }
      );
      setUser((prev) => ({ ...prev, role: selectedRole }));
      toast.success(`Role updated to ${selectedRole}`);
    } catch (error) {
      console.error("Role update failed", error);
      toast.error("Failed to update role");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <p className="p-6 text-center text-gray-500">Loading user details...</p>
    );
  }

  // 📊 Prepare data for chart
  const chartData = progress.map((item) => ({
    name: item.courseId?.title || "Unknown",
    completed: item.completedLessons?.length ?? 0,
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10 text-gray-900 dark:text-gray-100">
      {/* Toast Container */}
      <Toaster position="top-right" />

      {/* Back Button */}
      <button
        onClick={() => navigate("/real_admin/users")}
        className="mb-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        ← Back to Users
      </button>

      {/* User Info Card */}
      <div className="flex flex-col md:flex-row items-center md:items-start bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 gap-6">
        <img
          src={
            user.photoUrl ||
            "https://api.dicebear.com/7.x/initials/svg?seed=" + user.name
          }
          alt="User Avatar"
          className="w-32 h-32 rounded-full object-cover border-4 border-blue-600 shadow"
        />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p>
            <strong>Email:</strong> {user.email}
          </p>

          {/* Role Selector */}
          <div>
            <strong>Role:</strong>{" "}
            <div className="flex items-center gap-2 mt-1">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-white dark:bg-gray-700 text-black dark:text-white rounded px-2 py-1 border"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>

              <button
                onClick={handleRoleChange}
                disabled={selectedRole === user.role || isUpdating}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>

          <p>
            <strong>Enrolled Courses:</strong> {user.enrolledCourses.length}
          </p>
        </div>
      </div>

      {/* Purchase History */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">💳 Purchase History</h2>
        {purchases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-auto">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-2 px-4 text-left">Course</th>
                  <th className="py-2 px-4 text-left">Amount</th>
                  <th className="py-2 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr
                    key={p._id}
                    className="border-t border-gray-300 dark:border-gray-600"
                  >
                    <td className="py-2 px-4">{p.courseId?.title || "N/A"}</td>
                    <td className="py-2 px-4">${p.amount}</td>
                    <td className="py-2 px-4 capitalize">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No purchases found</p>
        )}
      </div>

      {/* Course Progress */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">📈 Course Progress</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="completed" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No progress data available</p>
        )}
      </div>
    </div>
  );
}
