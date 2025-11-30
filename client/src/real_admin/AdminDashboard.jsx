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
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .get(`${API_URL}/api/v1/admin/stats`, { withCredentials: true })
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
      <h1 className="text-3xl font-bold mb-6">📊 Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Detailed Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">User Demographics</h2>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={[
                  { name: "Students", value: stats.totalStudents },
                  { name: "Instructors", value: stats.totalInstructors },
                  { name: "Admins", value: stats.totalAdmins || 1 },
                  {
                    name: "Pending Requests",
                    value: stats.pendingRequests || 0,
                  },
                  {
                    name: "Inactive Users",
                    value: Math.max(
                      0,
                      stats.totalUsers -
                        (stats.totalStudents + stats.totalInstructors)
                    ),
                  },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={110}
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                <Cell fill="#60a5fa" /> {/* blue */}
                <Cell fill="#4ade80" /> {/* green */}
                <Cell fill="#facc15" /> {/* yellow */}
                <Cell fill="#fb7185" /> {/* red/pink */}
                <Cell fill="#a855f7" /> {/* purple */}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Advanced Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Platform Performance</h2>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={[
                { name: "Users", value: stats.totalUsers },
                { name: "Students", value: stats.totalStudents },
                { name: "Instructors", value: stats.totalInstructors },
                { name: "Courses", value: stats.totalCourses },
                { name: "Sales", value: stats.totalSales },
                { name: "Revenue", value: stats.totalRevenue },
                {
                  name: "Avg Revenue / Course",
                  value:
                    stats.totalCourses > 0
                      ? Math.round(stats.totalRevenue / stats.totalCourses)
                      : 0,
                },
                {
                  name: "Avg Revenue / Student",
                  value:
                    stats.totalStudents > 0
                      ? Math.round(stats.totalRevenue / stats.totalStudents)
                      : 0,
                },
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#f97316">
                {/* optional rainbow colors per bar */}
                <Cell fill="#60a5fa" />
                <Cell fill="#4ade80" />
                <Cell fill="#facc15" />
                <Cell fill="#fb7185" />
                <Cell fill="#a855f7" />
                <Cell fill="#f97316" />
                <Cell fill="#14b8a6" />
                <Cell fill="#c084fc" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
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
