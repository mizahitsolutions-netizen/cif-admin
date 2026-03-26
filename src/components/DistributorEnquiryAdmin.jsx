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

export default function DistributorEnquiry() {
  const [enquiries, setEnquiries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // ✅ Area Sales Managers state
  const [managers, setManagers] = useState([]);
  const [newManager, setNewManager] = useState({
    region: "",
    phone: "",
    email: "",
  });

  // ============================
  // 📡 FETCH DISTRIBUTOR ENQUIRIES
  // ============================
  useEffect(() => {
    const q = query(
      collection(db, "distributor_enquiries"),
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
  // 📡 FETCH AREA SALES MANAGERS
  // ============================
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "area_sales_managers"),
      (snapshot) => {
        setManagers(
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
  // ✅ MARK CONTACTED
  // ============================
  const markContacted = async (id) => {
    await updateDoc(doc(db, "distributor_enquiries", id), {
      contacted: true,
    });

    toast.success("Marked as contacted");
  };

  // ============================
  // ✏️ UPDATE MANAGER INLINE
  // ============================
  const updateManager = async (id, field, value) => {
    await updateDoc(doc(db, "area_sales_managers", id), {
      [field]: value,
    });
  };

  // ============================
  // ➕ ADD MANAGER
  // ============================
  const addManager = async () => {
    if (!newManager.region || !newManager.phone) {
      return toast.error("Region & Phone required");
    }

    await addDoc(collection(db, "area_sales_managers"), newManager);

    setNewManager({
      region: "",
      phone: "",
      email: "",
    });

    toast.success("Manager added");
  };

  // ============================
  // ❌ DELETE MANAGER
  // ============================
  const deleteManager = async (id) => {
    await deleteDoc(doc(db, "area_sales_managers", id));
    toast.success("Deleted");
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditData(item);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    await updateDoc(doc(db, "area_sales_managers", editingId), {
      region: editData.region,
      phone: editData.phone,
      email: editData.email,
    });

    toast.success("Updated");
    setEditingId(null);
  };

  return (
    <>
      {/* ============================
          🧑‍💼 AREA SALES MANAGERS
      ============================ */}
      <h1 className="text-3xl font-bold mb-6">Area Sales Managers</h1>

      {/* ADD NEW */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 grid md:grid-cols-4 gap-3">
        <input
          placeholder="Region"
          value={newManager.region}
          onChange={(e) =>
            setNewManager({
              ...newManager,
              region: e.target.value,
            })
          }
          className="border p-2 rounded"
        />

        <input
          placeholder="Phone"
          value={newManager.phone}
          onChange={(e) =>
            setNewManager({
              ...newManager,
              phone: e.target.value,
            })
          }
          className="border p-2 rounded"
        />

        <input
          placeholder="Email"
          value={newManager.email}
          onChange={(e) =>
            setNewManager({
              ...newManager,
              email: e.target.value,
            })
          }
          className="border p-2 rounded"
        />

        <button
          onClick={addManager}
          className="bg-green-600 text-white rounded px-4"
        >
          Add
        </button>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden mb-10">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Region</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {managers.map((item) => {
              const isEditing = editingId === item.id;

              return (
                <tr key={item.id} className="border-t">
                  {/* REGION */}
                  <td className="p-4">
                    {isEditing ? (
                      <input
                        value={editData.region}
                        onChange={(e) =>
                          setEditData({ ...editData, region: e.target.value })
                        }
                        className="border p-1 w-full rounded"
                      />
                    ) : (
                      item.region
                    )}
                  </td>

                  {/* PHONE */}
                  <td className="p-4">
                    {isEditing ? (
                      <input
                        value={editData.phone}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                        className="border p-1 w-full rounded"
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
                        className="border p-1 w-full rounded"
                      />
                    ) : (
                      item.email
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4 flex gap-2">
                    {isEditing ? (
                      <>
                        {/* SAVE */}
                        <button
                          onClick={saveEdit}
                          className="bg-green-600 text-white p-2 rounded"
                          title="Save"
                        >
                          <Save size={16} />
                        </button>

                        {/* CANCEL */}
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-400 text-white p-2 rounded"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* EDIT */}
                        <button
                          onClick={() => startEdit(item)}
                          className="bg-blue-600 text-white p-2 rounded"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => deleteManager(item.id)}
                          className="bg-red-500 text-white p-2 rounded"
                          title="Delete"
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

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4 mb-10">
        {managers.map((item) => {
          const isEditing = editingId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow p-4 space-y-2"
            >
              {/* REGION */}
              {isEditing ? (
                <input
                  value={editData.region}
                  onChange={(e) =>
                    setEditData({ ...editData, region: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                  placeholder="Region"
                />
              ) : (
                <p className="font-semibold">{item.region}</p>
              )}

              {/* PHONE */}
              {isEditing ? (
                <input
                  value={editData.phone}
                  onChange={(e) =>
                    setEditData({ ...editData, phone: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                  placeholder="Phone"
                />
              ) : (
                <p className="text-sm">{item.phone}</p>
              )}

              {/* EMAIL */}
              {isEditing ? (
                <input
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({ ...editData, email: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                  placeholder="Email"
                />
              ) : (
                <p className="text-sm text-gray-500">{item.email}</p>
              )}

              {/* ACTIONS */}
              <div className="flex gap-2 pt-2">
                {isEditing ? (
                  <>
                    {/* SAVE */}
                    <button
                      onClick={saveEdit}
                      className="flex-1 bg-green-600 text-white py-2 rounded flex items-center justify-center gap-1"
                    >
                      <Save size={16} /> Save
                    </button>

                    {/* CANCEL */}
                    <button
                      onClick={cancelEdit}
                      className="flex-1 bg-gray-400 text-white py-2 rounded flex items-center justify-center gap-1"
                    >
                      <X size={16} /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {/* EDIT */}
                    <button
                      onClick={() => startEdit(item)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-1"
                    >
                      <Pencil size={16} /> Edit
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() => deleteManager(item.id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded flex items-center justify-center gap-1"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================
          📦 DISTRIBUTOR ENQUIRIES
      ============================ */}
      <h1 className="text-3xl font-bold mb-8">Distributor Enquiries</h1>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">City</th>
              <th className="p-4 text-left">State</th>
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
                <td className="p-4">{item.city}</td>
                <td className="p-4">{item.state}</td>

                <td className="p-4">
                  {item.contacted ? (
                    <span className="text-green-600 font-medium">
                      Contacted
                    </span>
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

      {/* MOBILE */}
      <div className="md:hidden space-y-4">
        {enquiries.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow p-4">
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-gray-600">{item.company}</p>
            <p className="text-sm">{item.phone}</p>
            <p className="text-sm text-gray-500">
              {item.city}, {item.state}
            </p>

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
