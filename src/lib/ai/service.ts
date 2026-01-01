/**
 * Centralized AI Service Layer
 * All AI operations go through this secure service
 */

import { openRouterClient } from './client';
import {
  getExamGenerationPrompt,
  getGradingPrompt,
  getContentAnalysisPrompt,
  type ExamGenerationParams,
  type GradingParams,
} from './prompts';
import { logger } from '@/lib/logger';
import { QuestionType } from '@prisma/client';

export interface GeneratedQuestion {
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export interface ExamGenerationResult {
  questions: GeneratedQuestion[];
}

export interface ContentAnalysisResult {
  topics: string[];
  concepts: string[];
  suggestedDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  recommendedQuestions: number;
}

/**
 * AI Service for exam generation, grading, and content analysis
 */
export class AIService {
  /**
   * Generate exam questions from source material
   */
  async generateExam(
    params: ExamGenerationParams
  ): Promise<ExamGenerationResult> {
    const startTime = Date.now();

    try {
      logger.info('Starting exam generation', {
        title: params.title,
        subject: params.subject,
        difficulty: params.difficulty,
        questionCount: params.questionCount,
      });

      const { system, user } = getExamGenerationPrompt(params);

      const response = await openRouterClient.createCompletion(
        [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        {
          temperature: 0.7,
          max_tokens: 4000,
        }
      );

      const result =
        openRouterClient.parseJSONResponse<ExamGenerationResult>(response);

      // Validate result
      if (!result.questions || !Array.isArray(result.questions)) {
        throw new Error('Invalid response format: questions array missing');
      }

      if (result.questions.length === 0) {
        throw new Error('No questions generated');
      }

      // Validate each question
      result.questions.forEach((q, idx) => {
        if (!q.questionText || !q.questionType || !q.correctAnswer) {
          throw new Error(`Invalid question at index ${idx}`);
        }

        if (
          q.questionType === 'MULTIPLE_CHOICE' &&
          (!q.options || q.options.length < 2)
        ) {
          throw new Error(
            `Multiple choice question at index ${idx} missing options`
          );
        }
      });

      const duration = Date.now() - startTime;
      logger.info('Exam generation completed', {
        questionsGenerated: result.questions.length,
        duration,
      });

      return result;
    } catch (error) {
      logger.error('Exam generation failed', error, {
        params,
        duration: Date.now() - startTime,
      });
      throw new Error('Failed to generate exam questions');
    }
  }

  /**
   * Generate personalized feedback for exam attempt
   */
  async generateFeedback(params: GradingParams): Promise<string> {
    const startTime = Date.now();

    try {
      logger.info('Starting feedback generation', {
        examTitle: params.examTitle,
        score: params.score,
        percentage: params.percentage,
      });

      const { system, user } = getGradingPrompt(params);

      const response = await openRouterClient.createCompletion(
        [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        {
          temperature: 0.7,
          max_tokens: 1000,
          model: process.env.AI_MODEL_GRADING || 'openai/gpt-4o-mini',
        }
      );

      const feedback = openRouterClient.extractContent(response);

      if (!feedback || feedback.length < 50) {
        throw new Error('Generated feedback is too short');
      }

      const duration = Date.now() - startTime;
      logger.info('Feedback generation completed', {
        feedbackLength: feedback.length,
        duration,
      });

      return feedback;
    } catch (error) {
      logger.error('Feedback generation failed', error, {
        params: { examTitle: params.examTitle, score: params.score },
        duration: Date.now() - startTime,
      });

      // Fallback to basic feedback
      return this.generateBasicFeedback(params);
    }
  }

  /**
   * Analyze content to suggest exam parameters
   */
  async analyzeContent(text: string): Promise<ContentAnalysisResult> {
    const startTime = Date.now();

    try {
      logger.info('Starting content analysis', {
        textLength: text.length,
      });

      const { system, user } = getContentAnalysisPrompt(text);

      const response = await openRouterClient.createCompletion(
        [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        {
          temperature: 0.5,
          max_tokens: 500,
        }
      );

      const result =
        openRouterClient.parseJSONResponse<ContentAnalysisResult>(response);

      const duration = Date.now() - startTime;
      logger.info('Content analysis completed', {
        topics: result.topics.length,
        concepts: result.concepts.length,
        duration,
      });

      return result;
    } catch (error) {
      logger.error('Content analysis failed', error, {
        textLength: text.length,
        duration: Date.now() - startTime,
      });

      // Fallback to basic analysis
      return {
        topics: ['General Knowledge'],
        concepts: [],
        suggestedDifficulty: 'MEDIUM',
        recommendedQuestions: Math.min(Math.floor(text.length / 500), 20),
      };
    }
  }

  /**
   * Fallback basic feedback when AI fails
   */
  private generateBasicFeedback(params: GradingParams): string {
    const performanceLevel =
      params.percentage >= 90
        ? 'excellent'
        : params.percentage >= 75
        ? 'good'
        : params.percentage >= 60
        ? 'satisfactory'
        : 'needs improvement';

    return `## Performance Summary

You scored ${params.score} out of ${params.maxScore} (${params.percentage.toFixed(1)}%) on "${params.examTitle}". Your performance was ${performanceLevel}.

## What You Did Well

You demonstrated understanding in several areas covered by the exam. Keep building on this foundation!

## Areas to Focus On

Based on your incorrect answers, consider reviewing the topics where you struggled. Take time to understand the concepts thoroughly.

## Study Recommendations

- Review the explanations for questions you got wrong
- Practice similar questions to reinforce understanding
- Take breaks between study sessions for better retention
- Don't hesitate to seek additional resources if needed

## Keep Going!

Every exam is a learning opportunity. Use this feedback to guide your studies and keep improving! 🚀`;
  }
}

// Singleton instance
export const aiService = new AIService();
