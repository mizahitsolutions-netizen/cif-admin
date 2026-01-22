import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Package, ShoppingCart, Users } from "lucide-react";
import StatCard from "./StatCard";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  // 🔥 Real-time products
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })),
      );
    });

    return () => unsub();
  }, []);

  // 🔥 Real-time orders
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })),
      );
    });

    return () => unsub();
  }, []);

  // 🔥 Real-time users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })),
      );
    });

    return () => unsub();
  }, []);

  // 🏷️ Stock status helpers
  const lowStockCount = products.filter(
    (p) => p.quantity > 0 && p.quantity < 10,
  ).length;

  const outOfStock = products.filter((p) => p.quantity === 0);

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* 📊 Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={products.length}
          icon={Package}
          color="#3b82f6"
        />

        <StatCard
          title="Total Orders"
          value={orders.length}
          icon={ShoppingCart}
          color="#10b981"
        />

        <StatCard
          title="Total Users"
          value={users.length}
          icon={Users}
          color="#f59e0b"
        />

        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          icon={Package}
          color="#ef4444"
        />
      </div>

      {/* 📦 Recent Orders + Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 🛒 Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>

          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-sm text-gray-600">
                    {order.customer || "Customer"}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.status === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "Processing"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.status || "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ⚠️ Stock Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Stock Alerts</h2>

          <div className="space-y-3">
            {outOfStock.length === 0 && lowStockCount === 0 && (
              <p className="text-sm text-gray-500">
                All products are sufficiently stocked ✅
              </p>
            )}

            {products
              .filter((p) => p.quantity < 10)
              .map((stock) => (
                <div
                  key={stock.id}
                  className={`flex items-center justify-between p-3 rounded ${
                    stock.quantity === 0 ? "bg-red-50" : "bg-orange-50"
                  }`}
                >
                  <div>
                    <p className="font-semibold">{stock.name}</p>
                    <p className="text-sm text-gray-600">
                      {stock.quantity} units remaining
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      stock.quantity === 0
                        ? "bg-red-100 text-red-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {stock.quantity === 0 ? "Out of Stock" : "Low Stock"}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
