import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { Eye } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const totalItems = orders.items?.reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0,
  );

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Orders</h1>

      {/* 🧱 Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Order ID</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Items</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="p-4">#{order.id.slice(0, 6)}</td>
                <td className="p-4"> {order.address?.name || "—"}</td>
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
        {orders.map((order) => (
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
              className={`inline-block text-xs font-semibold ${
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

      {/* 👁️ Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Order #{selectedOrder.id}
            </h2>

            {/* 👤 Customer Details */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Customer Details</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <b>Name:</b> {selectedOrder.address?.name}
                </p>
                <p>
                  <b>Phone:</b> {selectedOrder.address?.phone}
                </p>
                <p>
                  <b>Address:</b> {selectedOrder.address?.line1},{" "}
                  {selectedOrder.address?.line2}, {selectedOrder.address?.city},{" "}
                  {selectedOrder.address?.state},{" "}
                  {selectedOrder.address?.country}
                </p>
              </div>
            </div>

            {/* 📦 Products */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Ordered Products</h3>

              <div className="space-y-4">
                {selectedOrder.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 items-center border rounded-lg p-3"
                  >
                    {/* 🖼 Product Image */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-contain border rounded"
                    />

                    {/* 📄 Product Info */}
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Package: {item.packageType}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.qty}
                      </p>
                    </div>

                    {/* 💰 Price */}
                    <div className="text-right font-semibold">
                      ₹{Number(item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 💳 Order Summary */}
            <div className="border-t pt-4 text-sm space-y-1">
              <p>
                <b>Payment Status:</b> {selectedOrder.paymentStatus}
              </p>
              <p>
                <b>Order Status:</b> {selectedOrder.status}
              </p>
              <p className="text-lg font-bold">
                Total: ₹{Number(selectedOrder.total).toFixed(2)}
              </p>
            </div>

            {/* Actions */}
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
