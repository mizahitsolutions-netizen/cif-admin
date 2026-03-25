import { useState } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Mail,
  Image,
  Star,
  List,
  PlusCircle,
  Inbox,
  UserCheck,
} from "lucide-react";

export default function Sidebar({
  currentPage,
  setCurrentPage,
  collapsed,
  setCollapsed,
}) {
  const [openMenu, setOpenMenu] = useState(null); // ✅ only one open

  const toggleMenu = (id) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  const menu = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },

    {
      id: "product",
      label: "Product",
      icon: Package,
      submenu: [
        { id: "stocks", label: "All Products", icon: List },
        { id: "addStock", label: "Add Product", icon: PlusCircle },
      ],
    },

    { id: "users", label: "Users", icon: Users },
    { id: "heroBanner", label: "Hero Banner", icon: Image },

    {
      id: "enquiry",
      label: "Enquiry",
      icon: Inbox,
      submenu: [
        { id: "bulkEnquiry", label: "Bulk Enquiry", icon: Mail },
        {
          id: "distributorEnquiry",
          label: "Distributor Enquiry",
          icon: UserCheck,
        },
      ],
    },

    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "newsletter", label: "Newsletter", icon: Mail },
    {
      id: "reviews",
      label: "Reviews",
      icon: Star,
      submenu: [
        { id: "reviewsTable", label: "All Reviews", icon: List },
        { id: "addreviews", label: "Add Review", icon: PlusCircle },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/"; // or navigate("/login")
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={`hidden md:flex flex-col h-screen bg-gray-900 text-white ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src="/images/fav.png"
            alt="Icon"
            className={`object-contain transition-all duration-300 ${
              collapsed ? "w-8 h-8" : "w-10 h-10"
            }`}
          />

          <img
            src="/images/logo.png"
            alt="Logo"
            className={`object-contain transition-all duration-300 ${
              collapsed ? "w-0 opacity-0" : "w-28 opacity-100"
            }`}
          />
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-800 rounded"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto mt-4 space-y-1 sidebar-scroll">
        {" "}
        {menu.map((item) => {
          const isOpen = openMenu === item.id;

          return (
            <div key={item.id}>
              {/* Parent */}
              <button
                onClick={() =>
                  item.submenu ? toggleMenu(item.id) : setCurrentPage(item.id)
                }
                className={`group flex items-center justify-between w-full px-4 py-3 transition ${
                  currentPage === item.id ? "bg-blue-600" : "hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 shrink-0" />

                  {!collapsed && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                </div>

                {/* Dropdown Arrow */}
                {item.submenu && !collapsed && (
                  <ChevronDown
                    className={`transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {/* Submenu */}
              {item.submenu && isOpen && !collapsed && (
                <div className="ml-10 space-y-1">
                  {item.submenu.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setCurrentPage(sub.id)}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded transition ${
                        currentPage === sub.id
                          ? "bg-blue-500"
                          : "hover:bg-gray-800"
                      }`}
                    >
                      <sub.icon className="w-4 h-4" />
                      <span>{sub.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      {/* 🔓 Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-600 rounded transition"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
