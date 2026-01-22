import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Plus,
  Menu,
} from "lucide-react";

export default function MobileNavbar({
  currentPage,
  setCurrentPage,
  setCollapsed,
}) {
  const menu = [
    { id: "dashboard", icon: LayoutDashboard },
    { id: "stocks", icon: Package },
    { id: "addStock", icon: Plus },
    { id: "users", icon: Users },
    { id: "orders", icon: ShoppingCart },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
      <div className="bg-gray-900 text-white rounded-full shadow-2xl px-8 py-3 flex items-center gap-4">
        
        {/* 🔰 Logo (Left) */}
        <img
          src="/fav.png"
          alt="Logo"
          className="w-8 h-8 object-contain"
        />

        {/* 📌 Menu Icons */}
        <div className="flex items-center gap-4">
          {menu.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`p-2 rounded-full transition ${
                currentPage === item.id
                  ? "bg-blue-600"
                  : "hover:bg-gray-800"
              }`}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </div>

        {/* ☰ Toggle Sidebar (Right) */}
        {/* <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="p-2 hover:bg-gray-800 rounded-full"
        >
          <Menu className="w-5 h-5" />
        </button> */}
      </div>
    </div>
  );
}
