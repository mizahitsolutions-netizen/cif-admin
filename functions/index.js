const functions = require("firebase-functions");
const admin = require("firebase-admin");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const os = require("os");
const path = require("path");
const fs = require("fs");

admin.initializeApp();
ffmpeg.setFfmpegPath(ffmpegPath);

exports.compressVideo = functions.storage
  .object()
  .onFinalize(async (object) => {
    const bucket = admin.storage().bucket(object.bucket);

    const filePath = object.name;

    // only process videos folder
    if (!filePath.startsWith("videos/")) return null;

    // skip already compressed
    if (filePath.includes("compressed")) return null;

    const fileName = path.basename(filePath);

    const tempFilePath = path.join(os.tmpdir(), fileName);
    const outputFilePath = path.join(
      os.tmpdir(),
      "compressed-" + fileName
    );

    // download file
    await bucket.file(filePath).download({
      destination: tempFilePath,
    });

    // compress video
    await new Promise((resolve, reject) => {
      ffmpeg(tempFilePath)
        .outputOptions([
          "-vcodec libx264",
          "-crf 28",
          "-preset fast",
          "-movflags faststart",
        ])
        .save(outputFilePath)
        .on("end", resolve)
        .on("error", reject);
    });

    const compressedPath = `videos/compressed-${fileName}`;

    // upload compressed file
    await bucket.upload(outputFilePath, {
      destination: compressedPath,
    });

    // get URL
    const file = bucket.file(compressedPath);
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "03-01-2500",
    });

    // update Firestore
    const db = admin.firestore();

    const snapshot = await db
      .collection("videos")
      .where("videoUrl", "==", object.mediaLink)
      .get();

    snapshot.forEach((doc) => {
      doc.ref.update({
        videoUrl: url,
        compressed: true,
      });
    });

    // cleanup temp files
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(outputFilePath);

    return null;
  });