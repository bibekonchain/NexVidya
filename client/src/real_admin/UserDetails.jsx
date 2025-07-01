// src/real_admin/UserDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    axios
      .get(`/api/v1/admin/users/${id}`, { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
        setPurchases(res.data.purchases);
        setProgress(res.data.progress);
      })
      .catch((err) => console.error("User details error:", err));
  }, [id]);

  if (!user) return <p className="p-4">Loading user details...</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">User: {user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">Enrolled Courses:</h2>
        <ul className="list-disc pl-6">
          {user.enrolledCourses.length > 0 ? (
            user.enrolledCourses.map((course) => (
              <li key={course._id}>{course.title}</li>
            ))
          ) : (
            <p>No enrolled courses</p>
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">Purchase History:</h2>
        {purchases.length ? (
          <table className="w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="py-2 px-4">Course</th>
                <th className="py-2 px-4">Amount</th>
                <th className="py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p._id}>
                  <td className="py-2 px-4">{p.courseId?.title || "N/A"}</td>
                  <td className="py-2 px-4">${p.amount}</td>
                  <td className="py-2 px-4">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No purchases found</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-2">Course Progress:</h2>
        {progress.length ? (
          <ul className="list-disc pl-6">
            {progress.map((p) => (
              <li key={p._id}>
                {p.courseId?.title || "N/A"} – {p.completedLessons.length}{" "}
                lessons completed
              </li>
            ))}
          </ul>
        ) : (
          <p>No progress data available</p>
        )}
      </section>
    </div>
  );
}
