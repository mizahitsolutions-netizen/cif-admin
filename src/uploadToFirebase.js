import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

export const uploadToFirebase = async (file, folder, onProgress) => {
  // 🚫 Max 80MB
  if (file.size > 80 * 1024 * 1024) {
    throw new Error("Video too large. Max 80MB allowed.");
  }

  const storage = getStorage();

  // 🔥 Force MP4 filename
  const extension = file.name.split(".").pop();

  const fileName = `${Date.now()}_${file.name.replace(
    `.${extension}`,
    "",
  )}.mp4`;

  const storageRef = ref(storage, `${folder}/${fileName}`);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: "video/mp4",
    });

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        if (onProgress) {
          onProgress(Math.round(percent));
        }
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        resolve(downloadURL);
      },
    );
  });
};
