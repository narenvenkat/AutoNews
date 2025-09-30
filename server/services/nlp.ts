interface SummaryResult {
  text: string;
  wordCount: number;
  qualityFlags?: Record<string, any>;
}

interface TTSResult {
  url: string;
  duration: number;
  sampleRate: number;
  format: string;
  size: number;
}

class NLPService {
  private readonly summarizerUrl: string;
  private readonly ttsUrl: string;

  constructor() {
    this.summarizerUrl = process.env.SUMMARIZER_URL || "https://api.huggingface.co/models/facebook/bart-large-cnn";
    this.ttsUrl = process.env.TTS_URL || "http://localhost:8001";
  }

  async checkStatus(): Promise<{ status: string; message?: string }> {
    try {
      // Check summarizer
      const summarizerResponse = await fetch(`${this.summarizerUrl}/health`, { 
        method: 'GET',
        timeout: 5000 
      }).catch(() => ({ ok: false, status: 500 }));

      // Check TTS service
      const ttsResponse = await fetch(`${this.ttsUrl}/health`, {
        method: 'GET',
        timeout: 5000
      }).catch(() => ({ ok: false, status: 500 }));

      if (summarizerResponse.ok && ttsResponse.ok) {
        return { status: "operational" };
      } else if (summarizerResponse.ok || ttsResponse.ok) {
        return { status: "degraded", message: "One service is down" };
      } else {
        return { status: "down", message: "Both services unavailable" };
      }
    } catch (error) {
      return { status: "down", message: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  async generateSummary(title: string, content: string, targetLengthSeconds = 90): Promise<SummaryResult> {
    try {
      // Estimate target word count (average 150 words per minute for speech)
      const targetWords = Math.round((targetLengthSeconds / 60) * 150 * 0.8); // 80% to account for pauses

      const payload = {
        inputs: `Summarize this news article in approximately ${targetWords} words:\n\nTitle: ${title}\n\nContent: ${content}`,
        parameters: {
          max_length: Math.min(targetWords + 20, 512),
          min_length: Math.max(targetWords - 20, 50),
          do_sample: false,
          early_stopping: true,
        },
      };

      const response = await fetch(this.summarizerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || process.env.API_KEY || ''}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Summarizer API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      let summaryText = '';

      if (Array.isArray(result) && result[0]?.summary_text) {
        summaryText = result[0].summary_text;
      } else if (result.summary_text) {
        summaryText = result.summary_text;
      } else if (Array.isArray(result) && result[0]?.generated_text) {
        summaryText = result[0].generated_text;
      } else {
        throw new Error('Invalid response format from summarizer');
      }

      // Clean up the summary
      summaryText = this.cleanSummaryText(summaryText);
      const wordCount = summaryText.split(/\s+/).length;

      // Quality checks
      const qualityFlags = {
        length_appropriate: wordCount >= targetWords * 0.7 && wordCount <= targetWords * 1.3,
        has_key_info: summaryText.toLowerCase().includes(title.split(' ')[0].toLowerCase()),
        no_repetition: !this.hasExcessiveRepetition(summaryText),
      };

      return {
        text: summaryText,
        wordCount,
        qualityFlags,
      };
    } catch (error) {
      console.error("Error generating summary:", error);
      throw error;
    }
  }

  async generateTTS(text: string, language = "en", voiceId = "default"): Promise<TTSResult> {
    try {
      // Normalize text for speech
      const normalizedText = this.normalizeTextForSpeech(text);

      const payload = {
        text: normalizedText,
        voice_id: voiceId,
        language: language,
        speed: 1.0,
        sample_rate: 22050,
      };

      const response = await fetch(`${this.ttsUrl}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      return {
        url: result.audio_url,
        duration: result.duration,
        sampleRate: result.sample_rate,
        format: result.format || 'wav',
        size: result.size || 0,
      };
    } catch (error) {
      console.error("Error generating TTS:", error);
      throw error;
    }
  }

  private cleanSummaryText(text: string): string {
    // Remove common artifacts and normalize
    return text
      .replace(/^(Summary:|Article:|News:)\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim()
      // Ensure proper sentence ending
      .replace(/[.!?]\s*$/, '') + '.';
  }

  private normalizeTextForSpeech(text: string): string {
    return text
      // Expand common abbreviations
      .replace(/\bUS\b/g, 'United States')
      .replace(/\bUK\b/g, 'United Kingdom')
      .replace(/\bAI\b/g, 'A I')
      .replace(/\bAPI\b/g, 'A P I')
      .replace(/\bCEO\b/g, 'C E O')
      .replace(/\bIPO\b/g, 'I P O')
      // Add pauses after periods
      .replace(/\.\s+/g, '. ... ')
      // Handle numbers
      .replace(/\$(\d+)([bB]illion)/g, '$1 billion dollars')
      .replace(/\$(\d+)([mM]illion)/g, '$1 million dollars')
      .replace(/(\d+)%/g, '$1 percent');
  }

  private hasExcessiveRepetition(text: string): boolean {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const uniqueSentences = new Set(sentences.map(s => s.trim().toLowerCase()));
    return uniqueSentences.size < sentences.length * 0.8;
  }
}

export const nlpService = new NLPService();
