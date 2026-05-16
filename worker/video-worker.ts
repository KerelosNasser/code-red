import { Worker, Job } from "bullmq";
import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs/promises";
import * as path from "path";
import { redis } from "../lib/queue/redis";
import { VideoJobData } from "../lib/queue/video-queue";
import { db } from "../lib/db";
import { lessons } from "../lib/db/schema";
import { eq } from "drizzle-orm";

console.log("Starting FFmpeg Video Worker...");

const worker = new Worker<VideoJobData>(
  "video-processing",
  async (job: Job<VideoJobData>) => {
    const { lessonId, inputPath, outputDir } = job.data;
    
    console.log(`[Job ${job.id}] Processing video for lesson: ${lessonId}`);

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, "playlist.m3u8");

    // FFmpeg HLS Transcoding
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        // Standard HLS configuration for a reasonable adaptive stream
        .outputOptions([
          "-profile:v baseline",
          "-level 3.0",
          "-start_number 0",
          "-hls_time 10", // 10 second segments
          "-hls_list_size 0", // Keep all segments in the playlist
          "-f hls"
        ])
        .output(outputPath)
        .on("end", async () => {
          console.log(`[Job ${job.id}] Transcoding finished!`);
          
          try {
            // Cleanup the original raw video to save disk space
            await fs.unlink(inputPath);
            console.log(`[Job ${job.id}] Cleaned up raw input file.`);

            // Update the database record to point to the new HLS playlist
            const relativeUrl = `/videos/hls/${lessonId}/playlist.m3u8`;
            await db.update(lessons)
              .set({ videoUrl: relativeUrl })
              .where(eq(lessons.id, lessonId));
              
            console.log(`[Job ${job.id}] Database updated successfully.`);
            resolve(true);
          } catch (err) {
            console.error(`[Job ${job.id}] Error during cleanup or DB update:`, err);
            reject(err);
          }
        })
        .on("error", (err) => {
          console.error(`[Job ${job.id}] FFmpeg Error:`, err);
          reject(err);
        })
        .on("progress", (progress) => {
          if (progress.percent) {
             job.updateProgress(Math.round(progress.percent));
          }
        })
        .run();
    });
  },
  { connection: redis, concurrency: 1 } // Process 1 video at a time to not blow up Hetzner VPS CPU
);

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully.`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed with error:`, err);
});
