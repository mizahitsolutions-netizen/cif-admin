// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isAdmin = localStorage.getItem("isAdmin");

  return isAdmin ? children : <Navigate to="/" />;
}
