import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { Eye } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState("ALL");

  /* 🔥 FETCH ORDERS */
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
    });

    return () => unsub();
  }, []);

  /* 🔥 FILTERING */
  const filteredOrders = orders.filter((order) => {
    const orderDate = order.createdAt?.seconds
      ? new Date(order.createdAt.seconds * 1000)
      : null;

    const now = new Date();

    const isToday =
      orderDate && orderDate.toDateString() === now.toDateString();

    const last7 = new Date();
    last7.setDate(now.getDate() - 7);

    const isLast7Days = orderDate && orderDate >= last7;

    const isThisMonth =
      orderDate &&
      orderDate.getMonth() === now.getMonth() &&
      orderDate.getFullYear() === now.getFullYear();

    let matchesQuick = true;

    if (quickFilter === "TODAY") matchesQuick = isToday;
    else if (quickFilter === "LAST7") matchesQuick = isLast7Days;
    else if (quickFilter === "MONTH") matchesQuick = isThisMonth;

    /* ✅ FIXED STATUS MATCH */
    const matchesStatus =
      statusFilter === "All" ||
      order.status?.toLowerCase() === statusFilter.toLowerCase();

    /* ✅ SAFE SEARCH */
    const matchesSearch = (order.address?.name || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesQuick && matchesStatus && matchesSearch;
  });

  /* 🔥 DATE FORMAT */
  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return "—";

    const date = new Date(timestamp.seconds * 1000);

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* 🔥 STATUS COLOR FIX */
  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();

    if (s === "delivered") return "bg-green-100 text-green-800";
    if (s === "confirmed") return "bg-blue-100 text-blue-800";
    if (s === "placed") return "bg-purple-100 text-purple-800";
    if (s === "cancelled") return "bg-red-100 text-red-800";

    return "bg-yellow-100 text-yellow-800"; // created / default
  };


  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      {/* 🔥 FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full md:w-1/4"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full md:w-1/5"
        >
          <option value="All">All Status</option>
          <option value="created">Created</option>
          <option value="confirmed">Confirmed</option>
          <option value="placed">Placed</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setQuickFilter("TODAY")}
            className={`px-4 py-2 rounded-lg border ${
              quickFilter === "TODAY" ? "bg-green-600 text-white" : "bg-white"
            }`}
          >
            Today
          </button>

          <button
            onClick={() => setQuickFilter("LAST7")}
            className={`px-4 py-2 rounded-lg border ${
              quickFilter === "LAST7" ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            Last 7 Days
          </button>

          <button
            onClick={() => setQuickFilter("MONTH")}
            className={`px-4 py-2 rounded-lg border ${
              quickFilter === "MONTH" ? "bg-purple-600 text-white" : "bg-white"
            }`}
          >
            This Month
          </button>

          <button
            onClick={() => setQuickFilter("ALL")}
            className="px-4 py-2 rounded-lg border bg-gray-200"
          >
            Clear
          </button>
        </div>
      </div>

      {/* 🧱 TABLE */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Order ID</th>
              <th className="p-4 text-left">Order Date</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Items</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Payment</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="p-4">#{order.id.slice(0, 6)}</td>
                <td className="p-4">{formatDate(order.createdAt)}</td>
                <td className="p-4">
                  {order.address?.name || order.address?.firstName || "—"}
                </td>

                <td className="p-4 text-sm">
                  {order.items?.length || 0} products /{" "}
                  {order.items?.reduce((s, i) => s + i.qty, 0) || 0} items
                </td>

                <td className="p-4">₹{Number(order.total || 0).toFixed(2)}</td>

                <td className="p-4">{order.paymentMethod || "-"}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                      order.status,
                    )}`}
                  >
                    {order.status || "Pending"}
                  </span>
                </td>

                <td className="p-4">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📱 MOBILE */}
      <div className="md:hidden space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between">
              <h2 className="font-semibold">Order #{order.id.slice(0, 6)}</h2>
              <Eye
                size={18}
                className="text-blue-600 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              />
            </div>

            <p className="text-xs text-gray-500">
              {formatDate(order.createdAt)}
            </p>

            <p className="text-sm">{order.address?.name}</p>

            <div className="flex justify-between text-sm mt-2">
              <span>
                {order.items?.reduce((s, i) => s + i.qty, 0) || 0} items
              </span>
              <span className="font-semibold">
                ₹{Number(order.total || 0).toFixed(2)}
              </span>
            </div>

            <span
              className={`text-xs font-semibold ${getStatusStyle(
                order.status,
              )}`}
            >
              {order.status}
            </span>
          </div>
        ))}
      </div>

      {/* 🔥 MODAL (UNCHANGED) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Order #{selectedOrder.id}
            </h2>

            <div className="mb-6 text-sm space-y-1">
              <p>
                <b>Name:</b> {selectedOrder.address?.name}
              </p>
              <p>
                <b>Phone:</b> {selectedOrder.address?.phone}
              </p>
              <p>
                <b>City:</b> {selectedOrder.address?.city}
              </p>
            </div>

            <div className="space-y-4">
              {selectedOrder.items?.map((item, i) => (
                <div key={i} className="flex gap-4 border p-3 rounded">
                  <img
                    src={item.imageUrl}
                    className="w-16 h-16 object-contain"
                  />
                  <div className="flex-1">
                    <p>{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                  </div>
                  <div>₹{item.price}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 font-bold">Total: ₹{selectedOrder.total}</div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
