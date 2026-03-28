import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";
import { Pencil, Save, X, Trash2 } from "lucide-react";

export default function BulkEnquiry() {
  const [enquiries, setEnquiries] = useState([]);

  // 🔥 CONTACT STATE
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    phone: "",
    email: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // ============================
  // 📡 FETCH BULK ENQUIRIES
  // ============================
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

  // ============================
  // 📡 FETCH CONTACTS
  // ============================
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "bulk_contact_details"),
      (snapshot) => {
        setContacts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        );
      },
    );

    return () => unsub();
  }, []);

  // ============================
  // ➕ ADD CONTACT
  // ============================
  const addContact = async () => {
    if (!newContact.phone) {
      return toast.error("Phone is required");
    }

    await addDoc(collection(db, "bulk_contact_details"), newContact);

    setNewContact({ phone: "", email: "" });
    toast.success("Contact added");
  };

  // ============================
  // ✏️ EDIT CONTACT
  // ============================
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditData(item);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    await updateDoc(doc(db, "bulk_contact_details", editingId), {
      phone: editData.phone,
      email: editData.email,
    });

    toast.success("Updated");
    setEditingId(null);
  };

  // ============================
  // ❌ DELETE CONTACT
  // ============================
  const deleteContact = async (id) => {
    await deleteDoc(doc(db, "bulk_contact_details", id));
    toast.success("Deleted");
  };

  // ============================
  // ✅ MARK CONTACTED
  // ============================
  const markContacted = async (id) => {
    await updateDoc(doc(db, "bulk_orders", id), {
      contacted: true,
    });

    toast.success("Marked as contacted");
  };

  return (
    <>
      {/* ============================
          📞 CONTACT DETAILS
      ============================ */}
      <h1 className="text-3xl font-bold mb-6">Bulk Contact Details</h1>

      {/* ADD */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 grid md:grid-cols-3 gap-3">
        <input
          placeholder="Phone"
          value={newContact.phone}
          onChange={(e) =>
            setNewContact({ ...newContact, phone: e.target.value })
          }
          className="border p-2 rounded"
        />

        <input
          placeholder="Email"
          value={newContact.email}
          onChange={(e) =>
            setNewContact({ ...newContact, email: e.target.value })
          }
          className="border p-2 rounded"
        />

        <button
          onClick={addContact}
          className="bg-green-600 text-white rounded px-4"
        >
          Add
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-10">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {contacts.map((item) => {
              const isEditing = editingId === item.id;

              return (
                <tr key={item.id} className="border-t">
                  {/* PHONE */}
                  <td className="p-4">
                    {isEditing ? (
                      <input
                        value={editData.phone}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                        className="border p-1 rounded w-full"
                      />
                    ) : (
                      item.phone
                    )}
                  </td>

                  {/* EMAIL */}
                  <td className="p-4">
                    {isEditing ? (
                      <input
                        value={editData.email}
                        onChange={(e) =>
                          setEditData({ ...editData, email: e.target.value })
                        }
                        className="border p-1 rounded w-full"
                      />
                    ) : (
                      item.email || "-"
                    )}
                  </td>

                  {/* ACTION */}
                  <td className="p-4 flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="bg-green-600 text-white p-2 rounded"
                        >
                          <Save size={16} />
                        </button>

                        <button
                          onClick={cancelEdit}
                          className="bg-gray-400 text-white p-2 rounded"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(item)}
                          className="bg-blue-600 text-white p-2 rounded"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => deleteContact(item.id)}
                          className="bg-red-500 text-white p-2 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ============================
          📦 BULK ENQUIRIES
      ============================ */}
      <h1 className="text-3xl font-bold mb-8">Bulk Order Enquiries</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
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

                <td className="p-4">
                  {item.contacted ? (
                    <span className="text-green-600">Contacted</span>
                  ) : (
                    <span className="text-red-500">Pending</span>
                  )}
                </td>

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
    </>
  );
}
