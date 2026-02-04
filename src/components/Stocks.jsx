import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase";
import { Trash2, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { compressImageToWebP } from "../compressImage";
import { uploadToFirebase } from "../uploadToFirebase";

/* 🔗 Slug generator */
const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/* 🧱 Skeleton Card */
const StockSkeleton = () => (
  <div className="bg-white rounded-xl shadow animate-pulse overflow-hidden">
    <div className="h-44 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
      <div className="flex justify-between pt-2">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-200 rounded w-12" />
      </div>
    </div>
  </div>
);

export default function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [newImage, setNewImage] = useState(null);

  /* 🔥 Fetch products (real-time) */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      setStocks(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })),
      );
      setLoading(false);
    });

    return () => unsub();
  }, []);

  /* 🔗 Convert download URL → storage path */
  const getStoragePathFromUrl = (url) => {
    const decoded = decodeURIComponent(url);
    return decoded.split("/o/")[1].split("?")[0];
  };

  /* 🗑️ Delete product */
  const deleteStock = async (product) => {
    if (!confirm("Delete this product?")) return;

    try {
      if (product.imageUrl) {
        const path = getStoragePathFromUrl(product.imageUrl);
        await deleteObject(ref(storage, path));
      }

      await deleteDoc(doc(db, "products", product.id));
      toast.success("Product deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  /* ✏️ Save edited product */
  const saveEdit = async () => {
    try {
      let imageUrl = editing.imageUrl;

      if (newImage) {
        if (editing.imageUrl) {
          const path = getStoragePathFromUrl(editing.imageUrl);
          await deleteObject(ref(storage, path));
        }

        const webp = await compressImageToWebP(newImage);
        imageUrl = await uploadToFirebase(webp);
      }

      await updateDoc(doc(db, "products", editing.id), {
        name: editing.name,
        slug: editing.slug,
        description: editing.description,
        quantity: Number(editing.quantity),
        price: Number(editing.price),
        packageType: editing.packageType,
        imageUrl,
      });

      toast.success("Product updated");
      setEditing(null);
      setNewImage(null);
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  /* 🏷️ Stock badge */
  const stockBadge = (qty) => {
    if (qty === 0)
      return (
        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
          Out of Stock
        </span>
      );

    if (qty < 10)
      return (
        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
          Low Stock
        </span>
      );

    return (
      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
        In Stock
      </span>
    );
  };

  /* 🔍 Filter + search */
  const filteredStocks = stocks
    .filter((p) => filter === "All" || p.packageType === filter)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Stock Management</h1>

      {/* 🔍 Search + Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          className="border p-2 rounded w-full sm:w-64"
          placeholder="Search by product name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {["All", "Small", "Medium", "Family"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded transition ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 🧱 Product Grid */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-500 ${
          loading ? "opacity-60" : "opacity-100"
        }`}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <StockSkeleton key={i} />)
          : filteredStocks.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-full object-contain transition-transform duration-300 hover:scale-105"
                  />
                </div>

                <div className="p-4 space-y-2">
                  <h2 className="font-semibold text-lg truncate">{p.name}</h2>

                  {stockBadge(p.quantity)}

                  <p className="text-sm text-gray-500 line-clamp-2">
                    {p.description}
                  </p>

                  <div className="flex justify-between text-sm">
                    <span>
                      Qty: <b>{p.quantity}</b>
                    </span>
                    <span className="font-bold text-blue-600">₹{p.price}</span>
                  </div>

                  <div className="flex justify-end gap-4 pt-3">
                    <button
                      onClick={() =>
                        setEditing({
                          ...p,
                          slug: p.slug || generateSlug(p.name),
                        })
                      }
                      className="text-blue-600 hover:scale-110 transition"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => deleteStock(p)}
                      className="text-red-600 hover:scale-110 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* ✏️ Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl w-full max-w-3xl animate-scaleIn">
            <h2 className="text-xl font-bold mb-6">Edit Product</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* FORM */}
              <div>
                <input
                  className="w-full border p-2 mb-2"
                  placeholder="Name"
                  value={editing.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditing({
                      ...editing,
                      name,
                      slug: generateSlug(name),
                    });
                  }}
                />

                <textarea
                  className="w-full border p-2 mb-2"
                  rows="3"
                  placeholder="Description"
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      description: e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  className="w-full border p-2 mb-2"
                  placeholder="Price"
                  value={editing.price}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      price: e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  className="w-full border p-2 mb-2"
                  placeholder="Quantity"
                  value={editing.quantity}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      quantity: e.target.value,
                    })
                  }
                />

                <select
                  className="w-full border p-2 mb-3"
                  value={editing.packageType}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      packageType: e.target.value,
                    })
                  }
                >
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Family</option>
                </select>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImage(e.target.files[0])}
                />
              </div>

              {/* IMAGE PREVIEW */}
              <div className="flex items-center justify-center">
                <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      newImage
                        ? URL.createObjectURL(newImage)
                        : editing.imageUrl
                    }
                    alt="Preview"
                    className="max-h-full max-w-full object-contain transition"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setEditing(null);
                  setNewImage(null);
                }}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
