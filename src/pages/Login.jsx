import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const isDisabled = !email || !password || loading;

  const handleLogin = () => {
    if (isDisabled) return;

    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      if (
        email === "admin@crumbellainnovativefoods.in" &&
        password === "Admin@123"
      ) {
        localStorage.setItem("isAdmin", "true");
        toast.success("Login successful 🎉");
        onLogin();
        navigate("/admin");
      } else {
        toast.error("Invalid credentials ❌");
      }

      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-96"
      >
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/images/logo.png" alt="Logo" className="h-16 object-contain" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Email address"
          className="w-full border border-gray-300 p-2.5 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <div className="relative mb-5">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full border border-gray-300 p-2.5 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-black"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={isDisabled}
          className={`w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition
            ${
              isDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-4">
          © {new Date().getFullYear()} Crumbella Innovative Foods
        </p>
      </motion.div>
    </div>
  );
}
