// src/real_admin/Users.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Users() {
  const [users, setUsers] = useState([]);
  console.log("Current logged-in user:", users); // get from Redux

  useEffect(() => {
    axios
      .get("/api/v1/admin/users", { withCredentials: true })
      .then((res) => {
        console.log("Fetched user response:", res); // <-- log it!
        setUsers(res.data.users || []);
      })
      .catch((err) => console.error("Failed to fetch users:", err));
  }, []);
  

  return (
    <div className="p-6">
      <h1 className="text-2xl text-gray-900 font-bold mb-4">All Users</h1>
      <div className="overflow-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-900 text-left">
              <th className="py-2  px-4">Name</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Role</th>
              <th className="py-2 px-4">Enrolled Courses</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t text-gray-900">
                <td className="py-2 px-4">{user.name}</td>
                <td className="py-2 px-4">{user.email}</td>
                <td className="py-2 px-4 capitalize">{user.role}</td>
                <td className="py-2 px-4">{user.enrolledCourses.length}</td>
                <td className="py-2 px-4">
                  <Link
                    to={`/real_admin/users/${user._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
