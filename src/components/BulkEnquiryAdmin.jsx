import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";

export default function BulkEnquiry() {
  const [enquiries, setEnquiries] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "bulk_orders"),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setEnquiries(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
    });

    return () => unsub();
  }, []);

  const markContacted = async (id) => {
    await updateDoc(doc(db, "bulk_orders", id), {
      contacted: true,
    });

    toast.success("Marked as contacted");
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Bulk Order Enquiries</h1>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Purpose</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {enquiries.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.company}</td>
                <td className="p-4">{item.phone}</td>
                <td className="p-4">{item.purpose}</td>

                {/* STATUS */}
                <td className="p-4">
                  {item.contacted ? (
                    <span className="text-green-600 font-medium">
                      Contacted
                    </span>
                  ) : (
                    <span className="text-red-500">Pending</span>
                  )}
                </td>

                {/* ACTION */}
                <td className="p-4">
                  {!item.contacted && (
                    <button
                      onClick={() => markContacted(item.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Mark as Contacted
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {enquiries.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow p-4">
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-gray-600">{item.company}</p>
            <p className="text-sm">{item.phone}</p>

            <p className="text-sm mt-2">
              Status:
              {item.contacted ? (
                <span className="text-green-600 ml-2">Contacted</span>
              ) : (
                <span className="text-red-500 ml-2">Pending</span>
              )}
            </p>

            {!item.contacted && (
              <button
                onClick={() => markContacted(item.id)}
                className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Mark as Contacted
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
