import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Dashboard from "../components/Dashboard";
import AddStock from "../components/AddStock";
import Stocks from "../components/Stocks";
import Users from "../components/Users";
import Orders from "../components/Orders";
import PageLoader from "../components/PageLoader";
import MobileNavbar from "../components/MobileNavbar";
import Newsletter from "../components/Newsletter";
import HeroBanner from "../components/HeroBanner";
import BulkEnquiryAdmin from "../components/BulkEnquiryAdmin";
import DistributorEnquiryAdmin from "../components/DistributorEnquiryAdmin";

export default function CookiesAdmin() {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("adminPage") || "dashboard";
  });

  const [collapsed, setCollapsed] = useState(false);

  // 🔥 NEW: loader state
  const [pageLoading, setPageLoading] = useState(false);

  // 🔁 Persist page
  useEffect(() => {
    localStorage.setItem("adminPage", currentPage);
  }, [currentPage]);

  // 🔥 Handle page change WITH loader
  const handlePageChange = (page) => {
    if (page === currentPage) return;

    setPageLoading(true);

    // Simulate loading delay (UX)
    setTimeout(() => {
      setCurrentPage(page);
      setPageLoading(false);
    }, 600); // ⏱️ 300–600ms feels perfect
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={handlePageChange} // 🔥 IMPORTANT
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto transition-all duration-300">
        <div className="p-8 h-full">
          {pageLoading ? (
            <PageLoader />
          ) : (
            <>
              {currentPage === "dashboard" && <Dashboard />}
              {currentPage === "addStock" && <AddStock />}
              {currentPage === "stocks" && <Stocks />}
              {currentPage === "users" && <Users />}
              {currentPage === "heroBanner" && <HeroBanner />}
              {currentPage === "orders" && <Orders />}
              {currentPage === "newsletter" && <Newsletter />}
              {currentPage === "bulkEnquiry" && <BulkEnquiryAdmin />}
              {currentPage === "distributorEnquiry" && (
                <DistributorEnquiryAdmin />
              )}
            </>
          )}
        </div>
      </main>
      {/* 🔥 Mobile Bottom Navbar */}
      <MobileNavbar
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
        setCollapsed={setCollapsed}
      />
    </div>
  );
}
