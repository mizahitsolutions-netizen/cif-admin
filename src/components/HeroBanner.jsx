import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase";
import { uploadToFirebase } from "../uploadToFirebase";
import { compressImageToWebP } from "../compressImage";
import {
  Trash2,
  Upload,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Pencil,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

/* Skeleton */
const BannerSkeleton = () => (
  <div className="bg-white rounded-xl shadow animate-pulse overflow-hidden">
    <div className="h-48 bg-gray-200" />
    <div className="p-4 flex justify-between">
      <div className="flex gap-2">
        <div className="w-5 h-5 bg-gray-200 rounded" />
        <div className="w-5 h-5 bg-gray-200 rounded" />
      </div>
      <div className="w-5 h-5 bg-gray-200 rounded" />
    </div>
  </div>
);

export default function HeroBanner() {
  const [banners, setBanners] = useState([]);
  const [image, setImage] = useState(null);
  const [link, setLink] = useState("");
  const [editingBanner, setEditingBanner] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  /* Fetch banners */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "heroBanners"), (snap) => {
      const data = snap.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => a.order - b.order);

      setBanners(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  /* Upload or Update */
  const handleSubmit = async () => {
    if (!image && !editingBanner) {
      toast.error("Select image first");
      return;
    }

    try {
      setLoadingUpload(true);

      let imageUrl = editingBanner?.imageUrl || "";

      // Upload new image if exists
      if (image) {
        const webp = await compressImageToWebP(image);
        imageUrl = await uploadToFirebase(webp, "heroBanners");
      }

      if (editingBanner) {
        // UPDATE
        await updateDoc(doc(db, "heroBanners", editingBanner.id), {
          imageUrl,
          link: link || "",
        });

        toast.success("Banner updated");
      } else {
        // CREATE
        await addDoc(collection(db, "heroBanners"), {
          imageUrl,
          link: link || "",
          order: banners.length,
          createdAt: serverTimestamp(),
        });

        toast.success("Banner uploaded");
      }

      // Reset
      setImage(null);
      setLink("");
      setEditingBanner(null);
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    } finally {
      setLoadingUpload(false);
    }
  };

  /* Delete */
  const deleteBanner = async (banner) => {
    if (!confirm("Delete this banner?")) return;

    try {
      const path = decodeURIComponent(
        banner.imageUrl.split("/o/")[1].split("?")[0],
      );

      await deleteObject(ref(storage, path));
      await deleteDoc(doc(db, "heroBanners", banner.id));

      toast.success("Banner deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  /* Move */
  const moveBanner = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= banners.length) return;

    const current = banners[index];
    const target = banners[newIndex];

    try {
      await updateDoc(doc(db, "heroBanners", current.id), {
        order: target.order,
      });

      await updateDoc(doc(db, "heroBanners", target.id), {
        order: current.order,
      });

      toast.success("Order updated");
    } catch (err) {
      console.error(err);
      toast.error("Reorder failed");
    }
  };

  /* Start edit */
  const startEdit = (banner) => {
    setEditingBanner(banner);
    setLink(banner.link || "");
    setImage(null);
  };

  /* Cancel edit */
  const cancelEdit = () => {
    setEditingBanner(null);
    setImage(null);
    setLink("");
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold mb-6">Hero Banner Management</h1>

      {/* Upload / Edit Section */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Preview */}
          <div className="w-full md:w-96 h-48 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                className="h-full object-contain"
              />
            ) : editingBanner ? (
              <img
                src={editingBanner.imageUrl}
                className="h-full object-contain"
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <ImageIcon size={40} />
                <span>Preview</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="w-full">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="mb-3"
            />

            <input
              type="text"
              placeholder="Enter product link (https://...)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="border px-3 py-2 rounded w-full mb-3"
            />

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loadingUpload}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Upload size={18} />
                {loadingUpload
                  ? "Processing..."
                  : editingBanner
                    ? "Update Banner"
                    : "Upload Banner"}
              </button>

              {editingBanner && (
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  <X size={16} />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <BannerSkeleton key={i} />)
          : banners.map((banner, index) => (
              <div
                key={banner.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition"
              >
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={banner.imageUrl}
                    className="h-full object-contain hover:scale-105 transition"
                  />
                </div>

                <div className="p-4 flex justify-between items-center">
                  {/* Move */}
                  <div className="flex gap-2">
                    <button
                      disabled={index === 0}
                      onClick={() => moveBanner(index, -1)}
                      className="disabled:opacity-30"
                    >
                      <ArrowUp size={18} />
                    </button>

                    <button
                      disabled={index === banners.length - 1}
                      onClick={() => moveBanner(index, 1)}
                      className="disabled:opacity-30"
                    >
                      <ArrowDown size={18} />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(banner)}
                      className="text-blue-600"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => deleteBanner(banner)}
                      className="text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Link Preview */}
                {banner.link && (
                  <div className="px-4 pb-4 text-sm text-gray-500 truncate">
                    🔗 {banner.link}
                  </div>
                )}
              </div>
            ))}
      </div>
    </div>
  );
}
