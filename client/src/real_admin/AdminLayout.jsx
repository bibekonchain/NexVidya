// src/real_admin/AdminLayout.jsx
import { Link } from "react-router-dom";

export default function AdminLayout({ children }) {
  return (
    <div className="flex">
      <aside className="w-64 h-screen bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          <Link to="/admin/dashboard" className="block hover:underline">
            Dashboard
          </Link>
          <Link to="/admin/users" className="block hover:underline">
            Users
          </Link>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-100 min-h-screen">{children}</main>
    </div>
  );
}
