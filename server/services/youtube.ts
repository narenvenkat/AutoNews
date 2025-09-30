import type { Job, Video, Publication } from "@shared/schema";
import { storage } from "../storage";

interface YouTubeUploadResult {
  videoId: string;
  status: string;
  publishedAt?: Date;
}

class YouTubeService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.clientId = process.env.YOUTUBE_CLIENT_ID || "";
    this.clientSecret = process.env.YOUTUBE_CLIENT_SECRET || "";
    this.redirectUri = process.env.YOUTUBE_REDIRECT_URI || "urn:ietf:wg:oauth:2.0:oob";
    
    if (!this.clientId || !this.clientSecret) {
      console.warn("YouTube API credentials not found. Set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET environment variables.");
    }
  }

  async checkStatus(): Promise<{ status: string; message?: string }> {
    try {
      if (!this.clientId || !this.clientSecret) {
        return { status: "down", message: "Credentials not configured" };
      }

      // Try to get a quota check (this requires auth, so we'll simulate)
      const response = await fetch("https://www.googleapis.com/youtube/v3/channels?part=id&mine=true", {
        headers: {
          'Authorization': `Bearer ${this.accessToken || 'test'}`,
        },
      });

      if (response.status === 401) {
        return { status: "degraded", message: "Authentication required" };
      } else if (response.status === 403) {
        return { status: "degraded", message: "Quota exceeded" };
      } else if (response.ok || response.status === 401) {
        return { status: "operational" };
      } else {
        return { status: "degraded", message: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { status: "down", message: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  async publishVideo(job: Job, video: Video): Promise<Publication> {
    try {
      if (!this.accessToken) {
        await this.refreshAccessToken();
      }

      // Get the summary for video metadata
      const summary = await storage.getSummaryByJobId(job.id);
      const article = await storage.getArticleByJobId(job.id);

      const title = this.generateTitle(article?.title || job.topic);
      const description = this.generateDescription(summary?.text || "", article?.url);
      const tags = this.generateTags(job.topic, job.language);

      // Upload video to YouTube
      const uploadResult = await this.uploadToYouTube(video.urlMp4, {
        title,
        description,
        tags,
        categoryId: "25", // News & Politics
        privacyStatus: "public",
        thumbnail: video.urlThumb,
      });

      // Create publication record
      const publication = await storage.createPublication({
        jobId: job.id,
        platform: "youtube",
        videoId: uploadResult.videoId,
        status: uploadResult.status,
        publishedAt: uploadResult.publishedAt,
      });

      console.log(`Published video to YouTube: https://www.youtube.com/watch?v=${uploadResult.videoId}`);
      return publication;
    } catch (error) {
      console.error("Error publishing to YouTube:", error);
      
      // Create failed publication record
      const publication = await storage.createPublication({
        jobId: job.id,
        platform: "youtube",
        videoId: "",
        status: "failed",
      });

      throw error;
    }
  }

  private async uploadToYouTube(videoUrl: string, metadata: {
    title: string;
    description: string;
    tags: string[];
    categoryId: string;
    privacyStatus: string;
    thumbnail?: string;
  }): Promise<YouTubeUploadResult> {
    if (!this.accessToken) {
      throw new Error("YouTube access token not available");
    }

    // First, download the video file
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
    }
    
    const videoBlob = await videoResponse.blob();

    // Upload video
    const uploadResponse = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
          categoryId: metadata.categoryId,
          defaultLanguage: "en",
          defaultAudioLanguage: "en",
        },
        status: {
          privacyStatus: metadata.privacyStatus,
          embeddable: true,
          license: "youtube",
        },
      }),
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`YouTube upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
    }

    const result = await uploadResponse.json();

    // Upload thumbnail if provided
    if (metadata.thumbnail) {
      await this.uploadThumbnail(result.id, metadata.thumbnail);
    }

    return {
      videoId: result.id,
      status: result.status.uploadStatus,
      publishedAt: result.status.publishAt ? new Date(result.status.publishAt) : new Date(),
    };
  }

  private async uploadThumbnail(videoId: string, thumbnailUrl: string): Promise<void> {
    try {
      const thumbnailResponse = await fetch(thumbnailUrl);
      if (!thumbnailResponse.ok) return;

      const thumbnailBlob = await thumbnailResponse.blob();

      await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'image/jpeg',
        },
        body: thumbnailBlob,
      });
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      // Don't fail the whole upload for thumbnail issues
    }
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available. Re-authentication required.");
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const tokens = await response.json();
    this.accessToken = tokens.access_token;
  }

  private generateTitle(originalTitle: string): string {
    // Ensure title is under 100 characters and compelling
    const cleanTitle = originalTitle.replace(/[^\w\s-]/g, '').trim();
    const maxLength = 90;
    
    if (cleanTitle.length <= maxLength) {
      return `🔥 ${cleanTitle} - Breaking News`;
    }
    
    return `🔥 ${cleanTitle.substring(0, maxLength - 20)}... - Breaking News`;
  }

  private generateDescription(summary: string, sourceUrl?: string): string {
    let description = `${summary}\n\n`;
    
    description += "🔔 Subscribe for more breaking news updates!\n";
    description += "📢 Like and share if you found this informative!\n\n";
    
    if (sourceUrl) {
      description += `📰 Source: ${sourceUrl}\n\n`;
    }
    
    description += "⚠️ This content was automatically generated using AI technology.\n";
    description += "#breakingnews #news #ai #automated";
    
    return description;
  }

  private generateTags(topic: string, language: string): string[] {
    const baseTags = [
      "breaking news",
      "news",
      "current events",
      "automated news",
      "ai generated",
    ];
    
    const topicTags = topic.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const langTags = language === "en" ? ["english news"] : [`${language} news`];
    
    return [...baseTags, ...topicTags, ...langTags].slice(0, 15);
  }

  setTokens(accessToken: string, refreshToken?: string): void {
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
  }
}

export const youtubeService = new YouTubeService();
