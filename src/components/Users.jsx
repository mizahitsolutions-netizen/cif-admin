import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Eye } from "lucide-react";
import toast from "react-hot-toast";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // 🔥 Real-time users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
    });

    return () => unsub();
  }, []);
  

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Users</h1>

      {/* 🧱 Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">User Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Orders</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-4">{user.username || user.firstName || "—"}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.ordersCount || 0}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status || "Active"}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => setSelectedUser(user)}
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
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-xl shadow p-4 space-y-2"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">{user.name || user.username || "Unnamed User"}</h2>
              <button
                onClick={() => setSelectedUser(user)}
                className="text-blue-600"
              >
                <Eye size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-600">{user.email}</p>

            <div className="flex justify-between text-sm">
              <span>Orders: {user.ordersCount || 0}</span>
              <span
                className={`font-semibold ${
                  user.status === "Active" ? "text-green-600" : "text-red-600"
                }`}
              >
                {user.status || "Active"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 👁️ View User Modal */}
      {selectedUser &&
        (() => {
          const defaultAddress = selectedUser.addresses?.find(
            (addr) => addr.isDefault === true,
          );

          return (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">User Details</h2>

                <div className="space-y-2 text-sm">
                  <p>
                    <b>Name:</b> {selectedUser.firstName}{" "}
                    {selectedUser.lastName}
                  </p>
                  <p>
                    <b>User Name:</b> {selectedUser.username}
                  </p>
                  <p>
                    <b>Phone Number:</b> {selectedUser.phone}
                  </p>
                  <p>
                    <b>Email:</b> {selectedUser.email}
                  </p>
                  <p>
                    <b>Default Address:</b>{" "}
                    {defaultAddress
                      ? `${defaultAddress.label} - ${defaultAddress.address}`
                      : "Not set"}
                  </p>
                  <p>
                    <b>Status:</b> {selectedUser.status || "Active"}
                  </p>
                  <p>
                    <b>Orders:</b> {selectedUser.ordersCount || 0}
                  </p>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </>
  );
}
