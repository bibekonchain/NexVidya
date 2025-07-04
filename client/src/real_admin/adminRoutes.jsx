// src/real_admin/adminRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import Users from "./Users";
import UserDetails from "./UserDetails";
import AdminLayout from "./AdminLayout";
import { useSelector } from "react-redux";

export default function AdminRoutes() {
  const { user } = useSelector((store) => store.auth);

  if (!user || user.role !== "admin") return <Navigate to="/" replace />;

  return (
    <AdminLayout>
      <Routes>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users/:id" element={<UserDetails />} />
        <Route path="users" element={<Users />} />
      </Routes>
    </AdminLayout>
  );
}
