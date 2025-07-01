// src/real_admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios
      .get("/api/v1/admin/stats", { withCredentials: true })
      .then((res) => setStats(res.data.stats))
      .catch((err) => console.error("Stats Error:", err));
  }, []);

  if (!stats) return <p className="p-4">Loading admin stats...</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Students" value={stats.totalStudents} />
        <StatCard title="Instructors" value={stats.totalInstructors} />
        <StatCard title="Courses" value={stats.totalCourses} />
        <StatCard title="Total Sales" value={stats.totalSales} />
        <StatCard title="Total Revenue" value={`$${stats.totalRevenue}`} />
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded shadow p-4 text-center">
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="text-xl font-semibold text-green-600">{value}</p>
    </div>
  );
}
