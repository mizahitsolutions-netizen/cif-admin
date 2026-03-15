import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Upload file to Firebase Storage
 * @param {File|Blob} file - compressed WebP file
 * @param {string} folder - storage folder (products, heroBanners, newsletter, etc.)
 * @returns {Promise<string>} download URL
 */
export const uploadToFirebase = async (file, folder = "products") => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);

    const fileName = `${timestamp}_${random}.webp`;

    // Create storage reference
    const storageRef = ref(storage, `${folder}/${fileName}`);

    // Upload file
    await uploadBytes(storageRef, file, {
      contentType: "image/webp",
      customMetadata: {
        originalName: file.name || "compressed.webp",
        uploadedAt: new Date().toISOString(),
        folder: folder,
      },
    });

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error("Firebase upload error:", error);
    throw error;
  }
};
