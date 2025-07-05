// src/real_admin/AdminLayout.jsx
import { Link, useLocation } from "react-router-dom";
import { BarChart2, Users } from "lucide-react";
import { cn } from "@/lib/utils"; // Optional helper for className merging

export default function AdminLayout({ children }) {
  const location = useLocation();

  const navItems = [
    {
      to: "/real_admin/dashboard",
      label: "Dashboard",
      icon: <BarChart2 size={18} />,
    },
    { to: "/real_admin/users", label: "Users", icon: <Users size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Admin Panel
        </h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition",
                location.pathname === item.to &&
                  "bg-gray-200 dark:bg-gray-700 font-semibold"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
