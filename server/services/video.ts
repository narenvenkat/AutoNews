interface VideoRenderRequest {
  summary: string;
  audioUrl: string;
  duration: number;
  images: string[];
  title: string;
  theme?: string;
}

interface VideoRenderResult {
  urlMp4: string;
  urlSrt?: string;
  urlThumb: string;
  width: number;
  height: number;
  duration: number;
  size: number;
}

class VideoService {
  private readonly serviceUrl: string;

  constructor() {
    this.serviceUrl = process.env.VIDEO_SERVICE_URL || "http://localhost:8002";
  }

  async checkStatus(): Promise<{ status: string; message?: string }> {
    try {
      const response = await fetch(`${this.serviceUrl}/health`, {
        method: 'GET',
        timeout: 5000
      });

      if (response.ok) {
        return { status: "operational" };
      } else {
        return { status: "degraded", message: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { status: "down", message: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  async renderVideo(request: VideoRenderRequest): Promise<VideoRenderResult> {
    try {
      const payload = {
        summary: request.summary,
        audio_url: request.audioUrl,
        duration: request.duration,
        images: request.images,
        title: request.title,
        theme: request.theme || "news",
        output_format: {
          width: 1920,
          height: 1080,
          fps: 30,
          codec: "h264",
          bitrate: "5M",
        },
        branding: {
          logo_url: process.env.BRAND_LOGO_URL,
          color_primary: "#3b82f6",
          color_secondary: "#1e40af",
          font_family: "Inter",
        },
      };

      const response = await fetch(`${this.serviceUrl}/render`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        timeout: 300000, // 5 minutes timeout for video rendering
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Video service error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();

      return {
        urlMp4: result.video_url,
        urlSrt: result.subtitle_url,
        urlThumb: result.thumbnail_url,
        width: result.width || 1920,
        height: result.height || 1080,
        duration: result.duration,
        size: result.size || 0,
      };
    } catch (error) {
      console.error("Error rendering video:", error);
      throw error;
    }
  }

  async generateThumbnail(videoUrl: string, timestamp = 5): Promise<string> {
    try {
      const payload = {
        video_url: videoUrl,
        timestamp: timestamp,
        width: 1280,
        height: 720,
        format: "jpg",
      };

      const response = await fetch(`${this.serviceUrl}/thumbnail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Thumbnail service error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.thumbnail_url;
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      throw error;
    }
  }

  async getVideoInfo(videoUrl: string): Promise<{ duration: number; width: number; height: number; size: number }> {
    try {
      const payload = { video_url: videoUrl };

      const response = await fetch(`${this.serviceUrl}/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Video info service error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return {
        duration: result.duration,
        width: result.width,
        height: result.height,
        size: result.size,
      };
    } catch (error) {
      console.error("Error getting video info:", error);
      throw error;
    }
  }
}

export const videoService = new VideoService();
