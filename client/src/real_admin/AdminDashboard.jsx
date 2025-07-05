// src/real_admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaBook,
  FaDollarSign,
  FaChartLine,
} from "react-icons/fa";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios
      .get("/api/v1/admin/stats", { withCredentials: true })
      .then((res) => setStats(res.data.stats))
      .catch((err) => console.error("Stats Error:", err));
  }, []);

  if (!stats)
    return (
      <p className="p-6 text-center text-gray-500 dark:text-gray-300">
        Loading admin stats...
      </p>
    );

  const cards = [
    { title: "Total Users", value: stats.totalUsers, icon: <FaUsers /> },
    {
      title: "Students",
      value: stats.totalStudents,
      icon: <FaGraduationCap />,
    },
    {
      title: "Instructors",
      value: stats.totalInstructors,
      icon: <FaChalkboardTeacher />,
    },
    { title: "Courses", value: stats.totalCourses, icon: <FaBook /> },
    { title: "Total Sales", value: stats.totalSales, icon: <FaDollarSign /> },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue}`,
      icon: <FaChartLine />,
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl  font-bold mb-6">
        📊 Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center transition hover:shadow-lg">
      <div className="text-3xl mb-2 text-blue-600 dark:text-blue-400">
        {icon}
      </div>
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
        {value}
      </p>
    </div>
  );
}
