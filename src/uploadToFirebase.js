import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export const uploadToFirebase = async (file) => {
  const fileName = `${Date.now()}.webp`; // 👈 ensure WebP extension

  const imageRef = ref(storage, `products/${fileName}`);

  await uploadBytes(imageRef, file, {
    contentType: "image/webp",
    customMetadata: {
      originalName: file.name,
    },
  });

  return await getDownloadURL(imageRef);
};
