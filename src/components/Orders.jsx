import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { Eye } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 🔍 Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quickFilter, setQuickFilter] = useState("ALL");
  // 🔥 Real-time orders
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

  // 🎯 Filtering Logic
  // const filteredOrders = orders.filter((order) => {
  //   const orderDate = order.createdAt?.seconds
  //     ? new Date(order.createdAt.seconds * 1000)
  //     : null;

  //   // ✅ Status filter
  //   const matchesStatus =
  //     statusFilter === "All" || order.status === statusFilter;

  //   // ✅ Search filter
  //   const matchesSearch = order.address?.name
  //     ?.toLowerCase()
  //     .includes(search.toLowerCase());

  //   // ✅ Date filter
  //   const matchesStart =
  //     !startDate || (orderDate && orderDate >= new Date(startDate));

  //   const matchesEnd =
  //     !endDate || (orderDate && orderDate <= new Date(endDate + "T23:59:59"));

  //   return matchesStatus && matchesSearch && matchesStart && matchesEnd;
  // });
  const filteredOrders = orders.filter((order) => {
    const orderDate = order.createdAt?.seconds
      ? new Date(order.createdAt.seconds * 1000)
      : null;

    const now = new Date();

    // 🟢 Today
    const isToday =
      orderDate && orderDate.toDateString() === now.toDateString();

    // 🔵 Last 7 Days
    const last7 = new Date();
    last7.setDate(now.getDate() - 7);

    const isLast7Days = orderDate && orderDate >= last7;

    // 🟣 This Month
    const isThisMonth =
      orderDate &&
      orderDate.getMonth() === now.getMonth() &&
      orderDate.getFullYear() === now.getFullYear();

    // 🎯 Apply Quick Filter
    let matchesQuick = true;

    if (quickFilter === "TODAY") matchesQuick = isToday;
    else if (quickFilter === "LAST7") matchesQuick = isLast7Days;
    else if (quickFilter === "MONTH") matchesQuick = isThisMonth;

    // 📦 Status
    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    // 🔍 Search
    const matchesSearch = order.address?.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    // 📅 Manual Date Range (only if no quick filter)
    const matchesStart =
      quickFilter !== "ALL" ||
      !startDate ||
      (orderDate && orderDate >= new Date(startDate));

    const matchesEnd =
      quickFilter !== "ALL" ||
      !endDate ||
      (orderDate && orderDate <= new Date(endDate + "T23:59:59"));

    return (
      matchesQuick &&
      matchesStatus &&
      matchesSearch &&
      matchesStart &&
      matchesEnd
    );
  });

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
  console.log(orders[0]);

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      {/* 🎛️ Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* 🔍 Search */}
        <input
          type="text"
          placeholder="Search customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full md:w-1/4"
        />

        {/* 📦 Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full md:w-1/5"
        >
          <option value="All">All Status</option>
          <option value="created">Created</option>
          <option value="confirmed">Confrimed</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <div className="flex flex-wrap gap-3 mb-4">
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
            onClick={() => {
              setQuickFilter("ALL");
              setStartDate("");
              setEndDate("");
            }}
            className="px-4 py-2 rounded-lg border bg-gray-200"
          >
            Clear
          </button>
        </div>

        {/* 📅 Start Date */}
        {/* <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full md:w-1/5"
        /> */}

        {/* 📅 End Date */}
        {/* <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full md:w-1/5"
        /> */}
      </div>

      {/* 🧱 Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Order ID</th>
              <th className="p-4 text-left">Order Date</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Items</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="p-4">#{order.id.slice(0, 6)}</td>
                <td className="p-4 ">{formatDate(order.createdAt)}</td>{" "}
                <td className="p-4">{order.address?.name || "—"}</td>
                <td className="p-4 text-sm">
                  {order.items.length} products /{" "}
                  {order.items.reduce((s, i) => s + i.qty, 0)} items
                </td>
                <td className="p-4">₹{Number(order.total || 0).toFixed(2)}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Processing"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                    }`}
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

      {/* 📱 Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow p-4 space-y-2"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Order #{order.id.slice(0, 6)}</h2>
              <button
                onClick={() => setSelectedOrder(order)}
                className="text-blue-600"
              >
                <Eye size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              {formatDate(order.createdAt)}
            </p>

            <p className="text-sm text-gray-600">{order.address?.name}</p>

            <div className="flex justify-between text-sm">
              <span>
                {order.items?.reduce(
                  (sum, item) => sum + Number(item.qty || 0),
                  0,
                )}{" "}
                items
              </span>

              <span className="font-semibold">
                ₹{Number(order.total || 0).toFixed(2)}
              </span>
            </div>

            <span
              className={`text-xs font-semibold ${
                order.status === "Delivered"
                  ? "text-green-600"
                  : order.status === "Processing"
                    ? "text-blue-600"
                    : "text-yellow-600"
              }`}
            >
              {order.status || "Pending"}
            </span>
          </div>
        ))}
      </div>

      {/* 👁️ Modal */}
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
