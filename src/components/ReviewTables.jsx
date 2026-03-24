import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { Star, Trash2, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { compressImageToWebP } from "../compressImage";
import { uploadToFirebase } from "../uploadToFirebase";

export default function ReviewsTable() {
  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedReviews, setSelectedReviews] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [editingReview, setEditingReview] = useState(null);

  const itemsPerPage = 5;

  /* 🔥 REALTIME FETCH */
  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(data);
      },
      (error) => {
        console.error(error);
        toast.error("Realtime sync failed");
      },
    );

    return () => unsubscribe();
  }, []);

  /* 🔍 Search + Filter */
  useEffect(() => {
    let data = [...reviews];

    if (searchTerm) {
      data = data.filter((r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (ratingFilter) {
      data = data.filter((r) => r.rating === Number(ratingFilter));
    }

    setFiltered(data);
    setCurrentPage(1);
  }, [searchTerm, ratingFilter, reviews]);

  /* 📄 Pagination */
  const start = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  /* 🗑 Delete */
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "reviews", id));
    toast.success("Deleted");
  };

  /* 🗑 Bulk Delete */
  const handleBulkDelete = async () => {
    if (selectedReviews.length === 0) {
      toast.error("No reviews selected");
      return;
    }

    for (let id of selectedReviews) {
      await deleteDoc(doc(db, "reviews", id));
    }

    setSelectedReviews([]);
    toast.success("Bulk deleted");
  };

  /* ✏️ Update */
  const handleUpdate = async () => {
    const ref = doc(db, "reviews", editingReview.id);

    let imageUrl = editingReview.imageUrl;

    try {
      // 🔁 If new image selected → upload it
      if (editingReview.newImage) {
        const webpImage = await compressImageToWebP(editingReview.newImage);

        imageUrl = await uploadToFirebase(webpImage, "reviews");
      }

      await updateDoc(ref, {
        name: editingReview.name,
        description: editingReview.description,
        rating: editingReview.rating,
        imageUrl, // ✅ updated or old
      });

      setEditingReview(null);
      toast.success("Updated");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  const getInitials = (name) => {
    if (!name) return "";

    const words = name.trim().split(" ");

    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const getColor = (name) => {
    const colors = [
      "bg-red-500",
      "bg-green-500",
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
    ];
    return colors[name.length % colors.length];
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Reviews</h1>

      {/* 🔍 Controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Search by name"
          className="p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="p-2 border rounded"
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} Stars
            </option>
          ))}
        </select>

        <button
          onClick={handleBulkDelete}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Delete Selected
        </button>

        <div className="ml-auto text-green-600 text-sm font-medium">
          ● Live Updates Enabled
        </div>
      </div>

      {/* 📊 Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3"></th>
              <th className="p-3">User</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Description</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((r) => (
              <tr key={r.id} className="border-t">
                {/* ✅ Checkbox */}
                <td className="p-3">
                  <input type="checkbox" />
                </td>

                {/* ✅ User */}
                <td className="p-3 text-center">
                  <div className="flex justify-center items-center gap-2">
                    {r.imageUrl ? (
                      <img
                        src={r.imageUrl}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-semibold">
                        {getInitials(r.name)}
                      </div>
                    )}

                    <span className="font-medium">{r.name}</span>
                  </div>
                </td>

                {/* ⭐ ✅ Rating (SEPARATE COLUMN) */}
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 ${
                          s <= r.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </td>

                {/* ✅ Description */}
                <td className="p-3 text-center">{r.description}</td>

                {/* ✅ Actions */}
                <td className="p-3 text-center align-middle">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => setEditingReview(r)}>
                      <Pencil />
                    </button>

                    <button onClick={() => handleDelete(r.id)}>
                      <Trash2 className="text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="p-4 text-gray-500">No reviews found</p>
        )}
      </div>

      {/* 📄 Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* ✏️ Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="text-lg font-bold mb-4">Edit Review</h2>

            {/* 🖼 Image Preview */}
            <div className="flex flex-col items-center mb-4">
              {(editingReview.newImage || editingReview.imageUrl) && (
                <img
                  src={
                    editingReview.newImage
                      ? URL.createObjectURL(editingReview.newImage)
                      : editingReview.imageUrl
                  }
                  className="w-20 h-20 rounded-full object-cover mb-2"
                />
              )}

              {/* 📁 Upload */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setEditingReview({
                    ...editingReview,
                    newImage: e.target.files[0],
                  })
                }
                className="text-sm"
              />

              {/* 🗑 Remove */}
              {(editingReview.imageUrl || editingReview.newImage) && (
                <button
                  onClick={() =>
                    setEditingReview({
                      ...editingReview,
                      imageUrl: null,
                      newImage: null,
                    })
                  }
                  className="text-red-500 text-sm mt-1"
                >
                  Remove Image
                </button>
              )}
            </div>

            {/* Name */}
            <input
              className="w-full border p-2 mb-2 rounded"
              placeholder="Name"
              value={editingReview.name}
              onChange={(e) =>
                setEditingReview({
                  ...editingReview,
                  name: e.target.value,
                })
              }
            />

            {/* Description */}
            <textarea
              className="w-full border p-2 mb-2 rounded"
              placeholder="Description"
              value={editingReview.description}
              onChange={(e) =>
                setEditingReview({
                  ...editingReview,
                  description: e.target.value,
                })
              }
            />

            {/* ⭐ Rating */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  onClick={() =>
                    setEditingReview({
                      ...editingReview,
                      rating: s,
                    })
                  }
                  className={`w-6 h-6 cursor-pointer transition ${
                    s <= editingReview.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingReview(null)}
                className="px-3 py-1 rounded border"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded"
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
