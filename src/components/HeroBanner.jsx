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
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  /* Fetch banners realtime sorted */
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

  /* Upload banner */
  const uploadBanner = async () => {
    if (!image) {
      toast.error("Select image first");
      return;
    }

    try {
      setLoadingUpload(true);

      const webp = await compressImageToWebP(image);
      const imageUrl = await uploadToFirebase(webp, "heroBanners");

      await addDoc(collection(db, "heroBanners"), {
        imageUrl,
        order: banners.length,
        createdAt: serverTimestamp(),
      });

      toast.success("Banner uploaded");
      setImage(null);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setLoadingUpload(false);
    }
  };

  /* Delete banner */
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

  /* Move banner up/down */
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

      toast.success("Banner order updated");
    } catch (err) {
      console.error(err);
      toast.error("Reorder failed");
    }
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold mb-6">Hero Banner Management</h1>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Preview */}
          <div className="w-full md:w-96 h-48 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                className="h-full object-contain animate-fadeIn"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <ImageIcon size={40} />
                <span>Preview</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="mb-3"
            />

            <button
              onClick={uploadBanner}
              disabled={loadingUpload}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition hover:scale-105"
            >
              <Upload size={18} />
              {loadingUpload ? "Uploading..." : "Upload Banner"}
            </button>
          </div>
        </div>
      </div>

      {/* Banner Grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-500 ${
          loading ? "opacity-60" : "opacity-100"
        }`}
      >
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <BannerSkeleton key={i} />)
          : banners.map((banner, index) => (
              <div
                key={banner.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={banner.imageUrl}
                    className="h-full object-contain transition-transform duration-300 hover:scale-105"
                  />
                </div>

                <div className="p-4 flex justify-between items-center">
                  {/* Order controls */}
                  <div className="flex gap-2">
                    <button
                      disabled={index === 0}
                      onClick={() => moveBanner(index, -1)}
                      className="text-gray-600 hover:text-black disabled:opacity-30 hover:scale-110 transition"
                    >
                      <ArrowUp size={18} />
                    </button>

                    <button
                      disabled={index === banners.length - 1}
                      onClick={() => moveBanner(index, 1)}
                      className="text-gray-600 hover:text-black disabled:opacity-30 hover:scale-110 transition"
                    >
                      <ArrowDown size={18} />
                    </button>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteBanner(banner)}
                    className="text-red-600 hover:scale-110 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
