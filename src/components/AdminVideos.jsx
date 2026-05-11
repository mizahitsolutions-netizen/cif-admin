import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { ref, deleteObject } from "firebase/storage";

import { db, storage } from "../firebase";
import { uploadToFirebase } from "../uploadToFirebase";

import toast from "react-hot-toast";

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // 🔹 FETCH VIDEOS
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "videos"), (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setVideos(data);
    });

    return () => unsub();
  }, []);

  // 🔹 CLEANUP PREVIEW
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 🔹 FILE SELECT
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video");
      return;
    }

    setVideoFile(file);

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
  };

  // 🔹 UPLOAD VIDEO
  const handleUpload = async () => {
    if (!videoFile) {
      return toast.error("Select a video");
    }

    try {
      setLoading(true);
      setProgress(0);

      console.log("Starting Upload...");

      // 🔥 Upload to Firebase
      const videoUrl = await uploadToFirebase(
        videoFile,
        "videos",
        (p) => {
          console.log("Upload Progress:", p);
          setProgress(p);
        },
      );

      console.log("Upload Complete:", videoUrl);

      // 🔥 Save Firestore
      await addDoc(collection(db, "videos"), {
        title,
        description,
        videoUrl,
        createdAt: serverTimestamp(),
      });

      toast.success("✅ Video uploaded successfully");

      // 🔹 RESET
      setVideoFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(null);

      setTitle("");
      setDescription("");

      setProgress(0);
    } catch (err) {
      console.error("UPLOAD ERROR:", err);

      toast.error(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 DELETE VIDEO
  const handleDelete = async (video) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this video?",
    );

    if (!confirmDelete) return;

    try {
      const path = decodeURIComponent(
        video.videoUrl.split("/o/")[1].split("?")[0],
      );

      // 🔥 Delete from Storage
      await deleteObject(ref(storage, path));

      // 🔥 Delete from Firestore
      await deleteDoc(doc(db, "videos", video.id));

      toast.success("✅ Deleted successfully");
    } catch (err) {
      console.error("DELETE ERROR:", err);

      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-8">
        Video Upload
      </h1>

      {/* UPLOAD CARD */}
      <div className="bg-white p-6 rounded-2xl shadow-xl space-y-6 mb-10">
        {/* FILE INPUT */}
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
        />

        {/* FILE INFO */}
        {videoFile && (
          <p className="text-sm text-gray-500">
            {videoFile.name} (
            {(videoFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}

        {/* PREVIEW */}
        {previewUrl && (
          <video
            src={previewUrl}
            controls
            playsInline
            preload="metadata"
            muted
            className="w-full rounded-lg max-h-[500px] bg-black"
          />
        )}

        {/* TITLE */}
        <input
          type="text"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* DESCRIPTION */}
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />

        {/* PROGRESS */}
        {loading && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-3 transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <p className="text-sm text-gray-600 text-center">
              Uploading {progress}%
            </p>
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-semibold transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Uploading..." : "Upload Video"}
        </button>
      </div>

      {/* VIDEO LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-xl shadow p-4"
          >
            {/* VIDEO */}
            <video
              controls
              playsInline
              preload="metadata"
              webkit-playsinline="true"
              className="w-full h-48 object-cover rounded bg-black"
            >
              <source
                src={video.videoUrl}
                type="video/mp4"
              />
            </video>

            {/* TITLE */}
            <h3 className="font-semibold mt-3">
              {video.title}
            </h3>

            {/* DESCRIPTION */}
            <p className="text-sm text-gray-600">
              {video.description}
            </p>

            {/* DELETE */}
            <button
              onClick={() => handleDelete(video)}
              className="mt-3 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}