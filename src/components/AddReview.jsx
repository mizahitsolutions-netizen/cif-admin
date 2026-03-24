import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { compressImageToWebP } from "../compressImage";
import { uploadToFirebase } from "../uploadToFirebase";
import { Star } from "lucide-react";
import toast from "react-hot-toast";

export default function AddReview() {
  const [loading, setLoading] = useState(false);

  const [review, setReview] = useState({
    name: "",
    description: "",
    rating: 0,
    image: null,
  });

  const handleAddReview = async () => {
    if (!review.name || !review.description || !review.rating) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      setLoading(true);
      toast.loading("Uploading review...", { id: "review" });

      /* 🔹 Image Upload (same as your product logic) */
      let imageUrl = "";

      if (review.image) {
        const webpImage = await compressImageToWebP(review.image);
        imageUrl = await uploadToFirebase(webpImage, "reviews");
      }

      /* 🔹 Save to Firestore */
      await addDoc(collection(db, "reviews"), {
        name: review.name,
        description: review.description,
        rating: review.rating,
        imageUrl: imageUrl || null, // ✅ safe fallback,
        createdAt: serverTimestamp(),
      });

      toast.success("Review added successfully ✅", { id: "review" });

      setReview({
        name: "",
        description: "",
        rating: 0,
        image: null,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add review ❌", { id: "review" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Add Review</h1>

      <div className="bg-white p-8 rounded-xl shadow max-w-2xl">
        {/* Name */}
        <input
          className="w-full p-2 border rounded mb-4"
          placeholder="Customer Name"
          value={review.name}
          onChange={(e) => setReview({ ...review, name: e.target.value })}
        />

        {/* ⭐ Rating */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              onClick={() => setReview({ ...review, rating: star })}
              className={`w-7 h-7 cursor-pointer transition ${
                star <= review.rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Description */}
        <textarea
          className="w-full p-2 border rounded mb-4"
          rows="3"
          placeholder="Review Description"
          value={review.description}
          onChange={(e) =>
            setReview({ ...review, description: e.target.value })
          }
        />

        {/* Image Preview */}
        {review.image && (
          <img
            src={URL.createObjectURL(review.image)}
            className="w-24 h-24 object-cover rounded-full mb-3"
            alt="Preview"
          />
        )}

        {/* Image Upload */}
        <input
          type="file"
          accept="image/*"
          className="w-full mb-6"
          onChange={(e) =>
            setReview({
              ...review,
              image: e.target.files[0],
            })
          }
        />

        {/* Submit */}
        <button
          onClick={handleAddReview}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Uploading..." : "Add Review"}
        </button>
      </div>
    </>
  );
}
