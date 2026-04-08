import { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { uploadToFirebase } from "../uploadToFirebase";
import { compressImageToWebP } from "../compressImage";
import toast from "react-hot-toast";

/* 🔥 Paragraph Component (prevents full re-render) */
const ParagraphInput = ({ value, onChange, onRemove }) => {
  return (
    <div className="flex gap-3 items-start">
      <textarea
        value={value}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border px-4 py-2 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 outline-none"
      />

      <button
        type="button"
        onClick={onRemove}
        className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
      >
        ✕
      </button>
    </div>
  );
};

export default function AdminAbout() {
  const containerRef = useRef(null);

  const [data, setData] = useState({
    heroImage: "",
    storyImage: "",
    storyTitle: "",
    storyParagraphs: [""],
    visionText: "",
    visionPoints: [""],
    missionPoints: [""],
    offerList: [""],
    offerImage: "",
    footerTitle: "",
    footerText: "",
  });

  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(false);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDoc(doc(db, "about_page", "main"));
      if (snap.exists()) setData(snap.data());
    };
    fetchData();
  }, []);

  // HANDLERS (optimized)
  const handleChange = (field, value) => {
    setData((prev) => {
      if (prev[field] === value) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleArrayChange = (field, index, value) => {
    setData((prev) => {
      const updated = [...prev[field]];
      if (updated[index] === value) return prev;

      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  const addItem = (field) => {
    setData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeItem = (field, index) => {
    setData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // SAVE
  const handleSave = async () => {
    try {
      setLoading(true);

      let updatedData = { ...data };

      for (const key in images) {
        if (images[key]) {
          const webp = await compressImageToWebP(images[key]);
          const url = await uploadToFirebase(webp, "about");
          updatedData[key] = url;
        }
      }

      await setDoc(doc(db, "about_page", "main"), updatedData);
      toast.success("✅ About Page Updated!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  // UI COMPONENTS
  const Section = ({ title, children }) => (
    <div className="bg-gray-50 p-5 rounded-xl space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );

  const ImageUpload = ({ label, field }) => (
    <div>
      <label className="block font-medium mb-2">{label}</label>

      <div className="flex gap-5 items-center">
        <div className="w-64 h-40 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
          {images[field] ? (
            <img src={URL.createObjectURL(images[field])} className="h-full" />
          ) : data[field] ? (
            <img src={data[field]} className="h-full" />
          ) : (
            <span className="text-gray-400">Preview</span>
          )}
        </div>

        <input
          type="file"
          onChange={(e) => setImages({ ...images, [field]: e.target.files[0] })}
        />
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">About Page Management</h1>

      <div className="bg-white shadow-xl rounded-2xl p-6 space-y-6">
        {/* HERO */}
        <Section title="Hero Section">
          <ImageUpload label="Hero Image" field="heroImage" />
        </Section>

        {/* STORY */}
        <Section title="Story Section">
          <ImageUpload label="Story Image" field="storyImage" />

          <input
            type="text"
            value={data.storyTitle}
            onChange={(e) => handleChange("storyTitle", e.target.value)}
            placeholder="Story Title"
            className="w-full border px-4 py-2 rounded-lg"
          />

          {data.storyParagraphs.map((p, i) => (
            <ParagraphInput
              key={i}
              value={p}
              onChange={(val) => handleArrayChange("storyParagraphs", i, val)}
              onRemove={() => removeItem("storyParagraphs", i)}
            />
          ))}

          <button
            type="button"
            onClick={() => addItem("storyParagraphs")}
            className="text-blue-600 font-medium hover:underline"
          >
            + Add Paragraph
          </button>
        </Section>

        {/* VISION */}
        <Section title="Vision Section">
          <textarea
            value={data.visionText}
            onChange={(e) => handleChange("visionText", e.target.value)}
            className="w-full border px-4 py-2 rounded-lg"
          />

          {data.visionPoints.map((p, i) => (
            <div key={i} className="flex gap-3">
              <input
                value={p}
                onChange={(e) =>
                  handleArrayChange("visionPoints", i, e.target.value)
                }
                className="w-full border px-4 py-2 rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeItem("visionPoints", i)}
              >
                ✕
              </button>
            </div>
          ))}

          <button type="button" onClick={() => addItem("visionPoints")}>
            + Add Vision Point
          </button>
        </Section>

        {/* MISSION */}
        <Section title="Mission Section">
          {data.missionPoints.map((p, i) => (
            <div key={i} className="flex gap-3">
              <input
                value={p}
                onChange={(e) =>
                  handleArrayChange("missionPoints", i, e.target.value)
                }
                className="w-full border px-4 py-2 rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeItem("missionPoints", i)}
              >
                ✕
              </button>
            </div>
          ))}

          <button type="button" onClick={() => addItem("missionPoints")}>
            + Add Mission
          </button>
        </Section>

        {/* OFFER */}
        <Section title="What We Offer">
          <ImageUpload label="Offer Image" field="offerImage" />

          {data.offerList.map((p, i) => (
            <div key={i} className="flex gap-3">
              <input
                value={p}
                onChange={(e) =>
                  handleArrayChange("offerList", i, e.target.value)
                }
                className="w-full border px-4 py-2 rounded-lg"
              />
              <button type="button" onClick={() => removeItem("offerList", i)}>
                ✕
              </button>
            </div>
          ))}

          <button type="button" onClick={() => addItem("offerList")}>
            + Add Offer Item
          </button>
        </Section>

        {/* FOOTER */}
        <Section title="Footer Section">
          <input
            type="text"
            value={data.footerTitle}
            onChange={(e) => handleChange("footerTitle", e.target.value)}
            className="w-full border px-4 py-2 rounded-lg"
          />

          <textarea
            value={data.footerText}
            onChange={(e) => handleChange("footerText", e.target.value)}
            className="w-full border px-4 py-2 rounded-lg"
          />
        </Section>

        {/* SAVE */}
        <div className="pt-4 border-t">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
