// src/real_admin/adminRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import Users from "./Users";
import UserDetails from "./UserDetails";
import AdminLayout from "./AdminLayout";

export default function AdminRoutes({ user }) {
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;

  return (
    <AdminLayout>
      <Routes>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/users/:id" element={<UserDetails />} />
      </Routes>
    </AdminLayout>
  );
}
