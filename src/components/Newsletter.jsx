import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

export default function Newsletter() {
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "newsletter_emails"),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setSubscribers(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
    });

    return () => unsub();
  }, []);

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Newsletter Subscribers</h1>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Subscribed On</th>
            </tr>
          </thead>

          <tbody>
            {subscribers.map((sub) => (
              <tr key={sub.id} className="border-t">
                <td className="p-4">{sub.email}</td>
                <td className="p-4 text-sm text-gray-600">
                  {sub.createdAt?.toDate().toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {subscribers.map((sub) => (
          <div key={sub.id} className="bg-white rounded-xl shadow p-4">
            <p className="font-semibold">{sub.email}</p>
            <p className="text-xs text-gray-500 mt-1">
              {sub.createdAt?.toDate().toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
