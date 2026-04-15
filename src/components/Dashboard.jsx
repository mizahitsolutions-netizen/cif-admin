import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { Package, ShoppingCart, Users } from "lucide-react";
import StatCard from "./StatCard";
import toast from "react-hot-toast";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // for toast comparison
  const [prevOrderCount, setPrevOrderCount] = useState(0);
  const [prevStockMap, setPrevStockMap] = useState({});

  /* 🔥 REAL-TIME LISTENERS */
  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLastUpdated(new Date());
    });

    const unsubOrders = onSnapshot(
      query(collection(db, "orders"), orderBy("createdAt", "desc")),
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLastUpdated(new Date());
      },
    );

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLastUpdated(new Date());
      setLoading(false);
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubUsers();
    };
  }, []);

  /* 📊 DERIVED DATA (OPTIMIZED) */
  const paidOrders = useMemo(
    () => orders.filter((o) => o.paymentStatus === "paid"),
    [orders],
  );

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.quantity > 0 && p.quantity < 10),
    [products],
  );

  const outOfStockProducts = useMemo(
    () => products.filter((p) => p.quantity === 0),
    [products],
  );

  const recentOrders = useMemo(() => paidOrders.slice(0, 5), [paidOrders]);

  /* 🔔 REAL-TIME TOAST ALERTS */
  useEffect(() => {
    if (prevOrderCount !== 0 && orders.length > prevOrderCount) {
      toast.success("🛒 New order received!");
    }
    setPrevOrderCount(orders.length);
  }, [orders]);

  useEffect(() => {
    const currentMap = {};

    products.forEach((p) => {
      currentMap[p.id] = p.quantity;

      const prevQty = prevStockMap[p.id];
      if (prevQty !== undefined) {
        if (p.quantity === 0 && prevQty > 0) {
          toast.error(`❌ ${p.name} is out of stock`);
        } else if (p.quantity < 10 && prevQty >= 10) {
          toast(`⚠️ ${p.name} is running low`, { icon: "⚠️" });
        }
      }
    });

    setPrevStockMap(currentMap);
  }, [products]);

  /* 📈 CHART DATA */
  const ordersChartData = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const date = o.createdAt?.toDate().toLocaleDateString();
      if (!date) return;
      map[date] = (map[date] || 0) + 1;
    });
    return Object.keys(map).map((d) => ({ date: d, orders: map[d] }));
  }, [orders]);

  const revenueChartData = useMemo(() => {
    const map = {};
    paidOrders.forEach((o) => {
      const date = o.createdAt?.toDate().toLocaleDateString();
      if (!date) return;
      map[date] = (map[date] || 0) + Number(o.total || 0);
    });
    return Object.keys(map).map((d) => ({ date: d, revenue: map[d] }));
  }, [paidOrders]);

  const stockChartData = useMemo(
    () =>
      products.map((p) => ({ name: p.name.slice(0, 12), stock: p.quantity })),
    [products],
  );

  const statusStyles = {
    confirmed: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    processing: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <p className="text-sm text-gray-500 mb-8 flex items-center gap-3">
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
          </span>
          Last updated: {lastUpdated?.toLocaleTimeString()}
        </p>
      </div>

      {/* 📊 STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Products"
          value={products.length}
          icon={Package}
          color="#3b82f6"
        />
        <StatCard
          title="Paid Orders"
          value={paidOrders.length}
          icon={ShoppingCart}
          color="#10b981"
        />
        <StatCard
          title="Users"
          value={users.length}
          icon={Users}
          color="#f59e0b"
        />
        <StatCard
          title="Low Stock"
          value={lowStockProducts.length}
          icon={Package}
          color="#ef4444"
        />
      </div>

      {/* 📦 ORDERS & STOCK ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* 🛒 Recent Orders */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Recent Orders
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded transition hover:shadow-sm hover:scale-[1.01]"
                >
                  <div>
                    <p className="font-semibold">
                      Order #{order.id.slice(0, 6).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.address?.name || order.address?.firstName || "Customer"}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusStyles[order.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ⚠️ Stock Alerts */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4">Stock Alerts</h2>

          {[...outOfStockProducts, ...lowStockProducts].length === 0 ? (
            <p className="text-sm text-gray-500">
              All products sufficiently stocked ✅
            </p>
          ) : (
            [...outOfStockProducts, ...lowStockProducts].map((p) => (
              <div
                key={p.id}
                className="flex justify-between p-3 rounded mb-2 bg-red-50"
              >
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-600">{p.quantity} left</p>
                </div>
                <span className="text-xs font-semibold">
                  {p.quantity === 0 ? "Out of Stock" : "Low Stock"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 📈 CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold mb-4">Orders Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={ordersChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="orders" stroke="#3b82f6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="revenue" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-10">
        <h3 className="font-semibold mb-4">Stock Levels</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stockChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="stock" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
