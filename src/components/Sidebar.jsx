import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  Mail,
  Image,
} from "lucide-react";

export default function Sidebar({
  currentPage,
  setCurrentPage,
  collapsed,
  setCollapsed,
}) {
const menu = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "stocks", label: "Stock", icon: Package },
  { id: "addStock", label: "Add Stock", icon: Plus },
  { id: "users", label: "Users", icon: Users },
  { id: "heroBanner", label: "Hero Banner", icon: Image },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "bulkEnquiry", label: "Bulk Enquiry", icon: Mail },
  { id: "distributorEnquiry", label: "Distributor Enquiry", icon: Mail },
  { id: "newsletter", label: "Newsletter", icon: Mail },
];

  return (
    <div
      className={`hidden md:block h-screen bg-gray-900 text-white transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Icon / Favicon (always visible) */}
          <img
            src="/fav.png"
            alt="Cookie Admin Icon"
            className={`object-contain transition-all duration-300 ${
              collapsed ? "w-8 h-8" : "w-10 h-10"
            }`}
          />

          {/* Full logo (only when expanded) */}
          <img
            src="/logo.png"
            alt="Cookie Admin Logo"
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
      <nav className="mt-4 space-y-1">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`group flex items-center gap-3 w-full px-4 py-3 transition ${
              currentPage === item.id ? "bg-blue-600" : "hover:bg-gray-800"
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />

            {!collapsed && (
              <span className="whitespace-nowrap">{item.label}</span>
            )}

            {/* Tooltip when collapsed */}
            {collapsed && (
              <span className="absolute left-20 bg-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
