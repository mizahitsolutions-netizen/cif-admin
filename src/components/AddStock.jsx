import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { compressImageToWebP } from "../compressImage";
import { uploadToFirebase } from "../uploadToFirebase";
import toast from "react-hot-toast";

/* 🔗 Slug generator */
const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function AddStock() {
  const [loading, setLoading] = useState(false);

  const [newStock, setNewStock] = useState({
    name: "",
    slug: "",
    description: "",
    quantity: "",
    price: "",
    packageType: "",
    image: null,
    isNew: true,
  });

  /* 🔍 Check slug uniqueness */
  const isSlugUnique = async (slug) => {
    const q = query(collection(db, "products"), where("slug", "==", slug));
    const snap = await getDocs(q);
    return snap.empty;
  };

  const handleAddProduct = async () => {
    if (
      !newStock.name ||
      !newStock.quantity ||
      !newStock.price ||
      !newStock.packageType ||
      !newStock.image
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const slug = generateSlug(newStock.name);

    try {
      setLoading(true);
      toast.loading("Uploading product...", { id: "upload" });

      /* 🔒 Slug uniqueness check */
      const unique = await isSlugUnique(slug);
      if (!unique) {
        toast.error("Product with same name already exists. Change name.", {
          id: "upload",
        });
        setLoading(false);
        return;
      }

      /* 🔹 Compress + Upload Image */
      const webpImage = await compressImageToWebP(newStock.image);
      const imageUrl = await uploadToFirebase(webpImage, "products");

      /* 🔹 Save product */
      await addDoc(collection(db, "products"), {
        name: newStock.name,
        slug, // ✅ UNIQUE SLUG
        description: newStock.description,
        quantity: Number(newStock.quantity),
        price: Number(newStock.price),
        packageType: newStock.packageType,
        imageUrl,
        createdAt: serverTimestamp(),
        isNew: newStock.isNew || false
      });

      toast.success("Product added successfully ✅", {
        id: "upload",
      });

      setNewStock({
        name: "",
        slug: "",
        description: "",
        quantity: "",
        price: "",
        packageType: "",
        image: null,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product ❌", {
        id: "upload",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Add New Product</h1>

      <div className="bg-white p-8 rounded-xl shadow max-w-4xl">
        {/* Name | Quantity | Price */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            className="p-2 border rounded"
            placeholder="Product name"
            value={newStock.name}
            onChange={(e) => {
              const name = e.target.value;
              setNewStock({
                ...newStock,
                name,
                slug: generateSlug(name),
              });
            }}
          />

          <input
            type="number"
            className="p-2 border rounded"
            placeholder="Stock"
            value={newStock.quantity}
            onChange={(e) =>
              setNewStock({
                ...newStock,
                quantity: e.target.value,
              })
            }
          />

          <input
            type="number"
            className="p-2 border rounded"
            placeholder="Price"
            value={newStock.price}
            onChange={(e) =>
              setNewStock({
                ...newStock,
                price: e.target.value,
              })
            }
          />
        </div>

        {/* SLUG (READ-ONLY PREVIEW) */}
        {/* <input
          className="w-full p-2 border rounded mb-4 bg-gray-50 text-gray-600"
          value={newStock.slug}
          readOnly
          placeholder="Slug will be generated automatically"
        /> */}

        {/* Description */}
        <textarea
          className="w-full p-2 border rounded mb-4"
          rows="3"
          placeholder="Description"
          value={newStock.description}
          onChange={(e) =>
            setNewStock({
              ...newStock,
              description: e.target.value,
            })
          }
        />

        {/* Package */}
        <select
          className="w-full p-2 border rounded mb-4"
          value={newStock.packageType}
          onChange={(e) =>
            setNewStock({
              ...newStock,
              packageType: e.target.value,
            })
          }
        >
          <option value="">Select package</option>
          <option value="Small">Small</option>
          <option value="Medium">Medium</option>
          <option value="Family">Family</option>
        </select>

        {/* New Tag */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={newStock.isNew}
            onChange={(e) =>
              setNewStock({
                ...newStock,
                isNew: e.target.checked,
              })
            }
          />
          <label className="text-sm font-medium">Mark as New Launch 🔥</label>
        </div>

        {/* Image */}
        {newStock.image && (
          <img
            src={URL.createObjectURL(newStock.image)}
            className="w-32 h-32 object-cover rounded mb-3"
            alt="Preview"
          />
        )}

        <input
          type="file"
          accept="image/*"
          className="w-full mb-6"
          onChange={(e) =>
            setNewStock({
              ...newStock,
              image: e.target.files[0],
            })
          }
        />

        {/* Submit */}
        <button
          onClick={handleAddProduct}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Uploading..." : "Add Product"}
        </button>
      </div>
    </>
  );
}
