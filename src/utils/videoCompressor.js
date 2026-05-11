import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();

export const compressVideo = async (file) => {
  if (!ffmpeg.loaded) {
    await ffmpeg.load();
  }

  const inputName = "input.mp4";
  const outputName = "output.mp4";

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  await ffmpeg.exec([
    "-i",
    inputName,
    "-vcodec",
    "libx264",
    "-crf",
    "28",
    "-preset",
    "fast",
    "-movflags",
    "+faststart",
    outputName,
  ]);

  const data = await ffmpeg.readFile(outputName);

  return new File([data.buffer], "compressed.mp4", {
    type: "video/mp4",
  });
};
