import imageCompression from "browser-image-compression";

export const compressImageToWebP = async (file) => {
  const options = {
    maxSizeMB: 0.7,           // 🔥 optimal size
    maxWidthOrHeight: 1920,   // Full HD
    useWebWorker: true,
    fileType: "image/webp",   // ✅ FORCE WebP
    initialQuality: 0.9,      // No visible quality loss
  };

  return await imageCompression(file, options);
};
