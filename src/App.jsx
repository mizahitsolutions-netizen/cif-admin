import CookiesAdmin from "./pages/CookiesAdmin";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      {/* 🔔 Toast container (global) */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
        }}
      />

      {/* Admin Page */}
      <CookiesAdmin />
    </>
  );
}
