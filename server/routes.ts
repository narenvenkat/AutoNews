import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertJobSchema, type Job } from "@shared/schema";
import { gnewsService } from "./services/gnews";
import { nlpService } from "./services/nlp";
import { videoService } from "./services/video";
import { youtubeService } from "./services/youtube";
import { scheduler } from "./jobs/scheduler";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Metrics endpoint
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Jobs CRUD
  app.get("/api/jobs", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const topic = req.query.topic as string;

      const filters = {
        ...(status && { status }),
        ...(topic && { topic }),
      };

      const jobs = await storage.getJobs({ page, limit, filters });
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJobById(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(jobData);
      
      // Start processing the job asynchronously
      processJob(job.id).catch(error => {
        console.error(`Error processing job ${job.id}:`, error);
        storage.updateJobStatus(job.id, "failed", error.message);
      });

      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.post("/api/jobs/:id/publish", async (req, res) => {
    try {
      const job = await storage.getJobById(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      if (job.status !== "completed") {
        return res.status(400).json({ message: "Job must be completed before publishing" });
      }

      const video = await storage.getVideoByJobId(job.id);
      if (!video) {
        return res.status(400).json({ message: "No video found for job" });
      }

      const publication = await youtubeService.publishVideo(job, video);
      res.json(publication);
    } catch (error) {
      console.error("Error publishing job:", error);
      res.status(500).json({ message: "Failed to publish job" });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      await storage.deleteJob(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // System status
  app.get("/api/system/status", async (req, res) => {
    try {
      const status = {
        gnews: await gnewsService.checkStatus(),
        nlp: await nlpService.checkStatus(),
        video: await videoService.checkStatus(),
        youtube: await youtubeService.checkStatus(),
      };
      res.json(status);
    } catch (error) {
      console.error("Error checking system status:", error);
      res.status(500).json({ message: "Failed to check system status" });
    }
  });

  // Manual triggers
  app.post("/api/system/sync", async (req, res) => {
    try {
      await scheduler.triggerNewsSync();
      res.json({ message: "News sync triggered successfully" });
    } catch (error) {
      console.error("Error triggering sync:", error);
      res.status(500).json({ message: "Failed to trigger sync" });
    }
  });

  app.post("/api/system/pause", async (req, res) => {
    try {
      scheduler.pauseAutomation();
      res.json({ message: "Automation paused successfully" });
    } catch (error) {
      console.error("Error pausing automation:", error);
      res.status(500).json({ message: "Failed to pause automation" });
    }
  });

  app.post("/api/system/resume", async (req, res) => {
    try {
      scheduler.resumeAutomation();
      res.json({ message: "Automation resumed successfully" });
    } catch (error) {
      console.error("Error resuming automation:", error);
      res.status(500).json({ message: "Failed to resume automation" });
    }
  });

  const httpServer = createServer(app);

  // Start the scheduler
  scheduler.start();

  return httpServer;
}

async function processJob(jobId: string): Promise<void> {
  try {
    await storage.updateJobStatus(jobId, "running", null, 10);

    // Step 1: Fetch article
    console.log(`[${jobId}] Fetching article from GNews API`);
    const job = await storage.getJobById(jobId);
    if (!job) throw new Error("Job not found");

    const articles = await gnewsService.fetchArticles(job.topic, job.language);
    if (!articles.length) throw new Error("No articles found");

    const article = await storage.createArticle({
      jobId,
      source: "gnews",
      url: articles[0].url,
      title: articles[0].title,
      content: articles[0].description,
      contentHash: generateHash(articles[0].description),
      mediaUrl: articles[0].image,
      publishedAt: new Date(articles[0].publishedAt),
    });

    await storage.updateJobStatus(jobId, "running", null, 25);

    // Step 2: Generate summary
    console.log(`[${jobId}] Generating summary`);
    const summaryResult = await nlpService.generateSummary(
      article.title,
      article.content,
      job.targetLength
    );

    const summary = await storage.createSummary({
      jobId,
      text: summaryResult.text,
      wordCount: summaryResult.wordCount,
      language: job.language,
      qualityFlags: summaryResult.qualityFlags || {},
    });

    await storage.updateJobStatus(jobId, "running", null, 50);

    // Step 3: Generate TTS
    console.log(`[${jobId}] Converting text to speech`);
    const audioResult = await nlpService.generateTTS(summary.text, job.language);

    const audio = await storage.createAudio({
      jobId,
      url: audioResult.url,
      duration: audioResult.duration,
      sampleRate: audioResult.sampleRate,
      format: audioResult.format,
      size: audioResult.size,
    });

    await storage.updateJobStatus(jobId, "running", null, 75);

    // Step 4: Generate video
    console.log(`[${jobId}] Rendering video`);
    const videoResult = await videoService.renderVideo({
      summary: summary.text,
      audioUrl: audio.url,
      duration: audio.duration,
      images: article.mediaUrl ? [article.mediaUrl] : [],
      title: article.title,
    });

    const video = await storage.createVideo({
      jobId,
      urlMp4: videoResult.urlMp4,
      urlSrt: videoResult.urlSrt,
      urlThumb: videoResult.urlThumb,
      width: videoResult.width,
      height: videoResult.height,
      duration: videoResult.duration,
      size: videoResult.size,
    });

    await storage.updateJobStatus(jobId, "completed", null, 100);

    // Step 5: Auto-publish if enabled
    if (job.autoPublish) {
      console.log(`[${jobId}] Auto-publishing to YouTube`);
      await youtubeService.publishVideo(job, video);
    }

    console.log(`[${jobId}] Job completed successfully`);
  } catch (error) {
    console.error(`[${jobId}] Job failed:`, error);
    await storage.updateJobStatus(jobId, "failed", error instanceof Error ? error.message : "Unknown error");
  }
}

function generateHash(content: string): string {
  // Simple hash function - in production, use crypto
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}
