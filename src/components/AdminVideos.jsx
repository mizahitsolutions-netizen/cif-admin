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

  // FETCH VIDEOS
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

  // CLEANUP
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // FILE SELECT
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVideoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // UPLOAD
  const handleUpload = async () => {
    if (!videoFile) return toast.error("Select a video");

    try {
      setLoading(true);
      setProgress(0);

      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 200);

      const videoUrl = await uploadToFirebase(videoFile, "videos");

      clearInterval(interval);
      setProgress(100);

      await addDoc(collection(db, "videos"), {
        title,
        description,
        videoUrl,
        createdAt: serverTimestamp(),
      });

      toast.success("✅ Video uploaded");

      // RESET
      setVideoFile(null);
      setPreviewUrl(null);
      setTitle("");
      setDescription("");
      setProgress(0);
    } catch (err) {
      console.error(err);
      toast.error("❌ Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // DELETE VIDEO
  const handleDelete = async (video) => {
    if (!confirm("Delete this video?")) return;

    try {
      const path = decodeURIComponent(
        video.videoUrl.split("/o/")[1].split("?")[0],
      );

      await deleteObject(ref(storage, path));
      await deleteDoc(doc(db, "videos", video.id));

      toast.success("Deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Video Upload</h1>

      {/* UPLOAD CARD */}
      <div className="bg-white p-6 rounded-2xl shadow-xl space-y-6 mb-10">
        <input type="file" accept="video/*" onChange={handleFileChange} />

        {videoFile && (
          <p className="text-sm text-gray-500">
            {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}

        {previewUrl && (
          <video src={previewUrl} controls className="w-full rounded-lg" />
        )}

        <input
          type="text"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-4 py-2 rounded-lg"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-4 py-2 rounded-lg"
        />

        {loading && (
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-blue-600 h-2"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl"
        >
          {loading ? `Uploading ${progress}%` : "Upload Video"}
        </button>
      </div>

      {/* VIDEO LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-xl shadow p-4">
            <video
              src={video.videoUrl}
              controls
              className="w-full h-48 object-cover rounded"
            />

            <h3 className="font-semibold mt-3">{video.title}</h3>
            <p className="text-sm text-gray-600">{video.description}</p>

            <button
              onClick={() => handleDelete(video)}
              className="mt-3 bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
