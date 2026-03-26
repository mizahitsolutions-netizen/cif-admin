import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Plus,
  Menu,
  Mail,
  X,
  List,
  PlusCircle,
  Inbox,
  UserCheck,
} from "lucide-react";

export default function MobileNavbar({ currentPage, setCurrentPage }) {
  const [openMenu, setOpenMenu] = useState(null);

  const menu = [
    { id: "dashboard", icon: LayoutDashboard },

    {
      id: "product",
      icon: Package,
      submenu: [
        { id: "stocks", label: "All Products", icon: List },
        { id: "addStock", label: "Add Product", icon: PlusCircle },
      ],
    },

    { id: "users", icon: Users },

    {
      id: "enquiry",
      icon: Mail,
      submenu: [
        { id: "bulkEnquiry", label: "Bulk Enquiry", icon: Inbox },
        {
          id: "distributorEnquiry",
          label: "Distributor Enquiry",
          icon: UserCheck,
        },
      ],
    },

    { id: "orders", icon: ShoppingCart },
  ];

  return (
    <>
      {/* 🔻 Bottom Navbar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <div className="bg-gray-900 text-white rounded-full shadow-2xl px-6 py-3 flex items-center gap-4">
          {/* Logo */}
          <img src="/images/fav.png" alt="Logo" className="w-8 h-8 object-contain" />

          {/* Menu */}
          <div className="flex items-center gap-4">
            {menu.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  item.submenu ? setOpenMenu(item) : setCurrentPage(item.id)
                }
                className={`p-2 rounded-full transition ${
                  currentPage === item.id ? "bg-blue-600" : "hover:bg-gray-800"
                }`}
              >
                <item.icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🔥 Bottom Sheet (Submenu Popup) */}
      {openMenu && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 md:hidden">
          <div className="w-full bg-gray-900 text-white rounded-t-2xl p-5 animate-slideUp">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold capitalize">
                {openMenu.id}
              </h2>
              <button onClick={() => setOpenMenu(null)}>
                <X />
              </button>
            </div>

            {/* Submenu Items */}
            <div className="space-y-3">
              {openMenu.submenu.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setCurrentPage(sub.id);
                    setOpenMenu(null);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition ${
                    currentPage === sub.id ? "bg-blue-600" : "hover:bg-gray-800"
                  }`}
                >
                  <sub.icon className="w-5 h-5" />
                  <span>{sub.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
