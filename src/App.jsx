import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import CookiesAdmin from "./pages/CookiesAdmin";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { useState } from "react";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isAdmin") === "true",
  );

  return (
    <Router>
      {/* 🔔 Toast */}
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      <Routes>
        {/* 🔑 Login Page */}
        <Route
          path="/"
          element={<Login onLogin={() => setIsLoggedIn(true)} />}
        />

        {/* 🔒 Protected Admin Page */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <CookiesAdmin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
