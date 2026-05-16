import { Queue } from "bullmq";
import { redis } from "./redis";

export interface VideoJobData {
  lessonId: string;
  inputPath: string; // The raw .mp4 uploaded to temp folder
  outputDir: string; // The destination directory for the .m3u8 and .ts files
}

export const videoQueue = new Queue<VideoJobData>("video-processing", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
  },
});
