import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AIRequestOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

/**
 * Centralized OpenRouter API client
 * All AI calls go through this secure service
 */
export class OpenRouterClient {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';
  private defaultModel: string;

  constructor() {
    this.apiKey = env.OPENROUTER_API_KEY;
    this.defaultModel = env.AI_MODEL_GENERATION || 'openai/gpt-4o-mini';
  }

  /**
   * Make a completion request to OpenRouter
   */
  async createCompletion(
    messages: { role: string; content: string }[],
    options: AIRequestOptions = {}
  ): Promise<OpenRouterResponse> {
    const model = options.model || this.defaultModel;

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://scorex.app',
          'X-Title': 'ScoreX - AI Learning Platform',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 4000,
          top_p: options.top_p ?? 1,
          stream: options.stream ?? false,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error('OpenRouter API error', { status: response.status, error });
        throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
      }

      const data = await response.json();

      // Log usage for monitoring
      if (data.usage) {
        logger.info('AI request completed', {
          model,
          tokens: data.usage.total_tokens,
          prompt_tokens: data.usage.prompt_tokens,
          completion_tokens: data.usage.completion_tokens,
        });
      }

      return data;
    } catch (error) {
      logger.error('Failed to create AI completion', error);
      throw error;
    }
  }

  /**
   * Extract content from response
   */
  extractContent(response: OpenRouterResponse): string {
    return response.choices[0]?.message?.content || '';
  }

  /**
   * Parse JSON response with error handling
   */
  parseJSONResponse<T>(response: OpenRouterResponse): T {
    const content = this.extractContent(response);

    try {
      // Remove markdown code blocks if present
      const cleaned = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      return JSON.parse(cleaned) as T;
    } catch (error) {
      logger.error('Failed to parse AI JSON response', { content, error });
      throw new Error('Invalid JSON response from AI');
    }
  }
}

// Singleton instance
export const openRouterClient = new OpenRouterClient();
