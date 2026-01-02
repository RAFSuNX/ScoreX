/**
 * Secure AI Prompt Templates
 * All prompts are server-side only and never exposed to client
 */

import { Difficulty, QuestionType } from '@prisma/client';

export interface ExamGenerationParams {
  sourceText: string;
  title: string;
  subject: string;
  difficulty: Difficulty;
  questionCount: number;
  questionTypes: QuestionType[];
}

export interface GradingParams {
  examTitle: string;
  questions: Array<{
    questionText: string;
    questionType: QuestionType;
    correctAnswer: string;
    userAnswer: string;
    options?: Record<string, string> | null;
  }>;
  score: number;
  maxScore: number;
  percentage: number;
}

/**
 * System prompt for exam generation
 */
const EXAM_GENERATION_SYSTEM_PROMPT = `You are an expert educational content creator specializing in generating high-quality exam questions from source material.

Your responsibilities:
1. Analyze the provided content thoroughly
2. Create questions that test understanding, not just memorization
3. Ensure questions are clear, unambiguous, and grammatically correct
4. Make distractors plausible but clearly incorrect
5. Provide detailed explanations that teach the concept
6. Match the difficulty level requested
7. Cover diverse topics from the source material

Quality standards:
- Questions should be challenging but fair
- Avoid trick questions or ambiguous wording
- Explanations should be educational and concise
- Multiple choice options should be balanced in length
- Cover the full range of difficulty within the specified level`;

/**
 * Generate exam questions prompt
 */
export function getExamGenerationPrompt(params: ExamGenerationParams): {
  system: string;
  user: string;
} {
  const difficultyGuidelines = {
    EASY: 'Focus on basic recall and fundamental concepts. Questions should test foundational knowledge.',
    MEDIUM: 'Balance between recall and application. Include some analysis and interpretation.',
    HARD: 'Emphasize critical thinking, analysis, and synthesis. Include complex scenarios.',
  };

  const questionTypeInstructions = params.questionTypes
    .map((type) => {
      switch (type) {
        case 'MULTIPLE_CHOICE':
          return '- Multiple Choice: Provide 4 options (A, B, C, D) with one correct answer';
        case 'TRUE_FALSE':
          return '- True/False: Create clear statements that are definitively true or false';
        case 'FILL_IN_THE_BLANK':
          return '- Fill in the Blank: Create sentences with a key term or concept replaced by _____, requiring precise recall';
        case 'SHORT_ANSWER':
          return '- Short Answer: Require 1-3 sentence responses showing understanding';
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n');

  const userPrompt = `Generate ${params.questionCount} exam questions for: "${params.title}"

Subject: ${params.subject}
Difficulty: ${params.difficulty}
Difficulty Guidelines: ${difficultyGuidelines[params.difficulty]}

Question Types to Include:
${questionTypeInstructions}

Source Material:
"""
${params.sourceText}
"""

CRITICAL REQUIREMENTS:
1. Generate EXACTLY ${params.questionCount} questions
2. Distribute questions evenly across topics in the source material
3. Ensure variety in question types as specified
4. Each question must include a detailed explanation
5. For multiple choice, make all options plausible
6. Avoid yes/no questions for multiple choice
7. Focus on understanding, not trivial facts

OUTPUT FORMAT (JSON):
{
  "questions": [
    {
      "questionText": "Clear, specific question (use _____ for fill-in-the-blank)",
      "questionType": "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_THE_BLANK" | "SHORT_ANSWER",
      "options": ["A", "B", "C", "D"] (for MULTIPLE_CHOICE only),
      "correctAnswer": "The correct answer (exact word/phrase for FILL_IN_THE_BLANK)",
      "explanation": "Detailed explanation of why this is correct and why others are wrong",
      "points": 1
    }
  ]
}

Generate the questions now in valid JSON format:`;

  return {
    system: EXAM_GENERATION_SYSTEM_PROMPT,
    user: userPrompt,
  };
}

/**
 * System prompt for grading
 */
const GRADING_SYSTEM_PROMPT = `You are an expert educational assessor providing personalized feedback to students.

Your responsibilities:
1. Evaluate student performance objectively
2. Provide constructive, encouraging feedback
3. Identify strengths and areas for improvement
4. Suggest specific study strategies
5. Maintain a supportive, educational tone
6. Use markdown formatting for clarity

Feedback guidelines:
- Start with positive reinforcement
- Be specific about what was done well
- Provide actionable improvement suggestions
- Reference specific question topics
- End with encouragement
- Use bullet points and headings for structure`;

/**
 * Generate personalized feedback prompt
 */
export function getGradingPrompt(params: GradingParams): {
  system: string;
  user: string;
} {
  const performanceLevel =
    params.percentage >= 90
      ? 'excellent'
      : params.percentage >= 75
      ? 'good'
      : params.percentage >= 60
      ? 'satisfactory'
      : 'needs improvement';

  const questionSummary = params.questions
    .map((q, idx) => {
      const isCorrect = q.userAnswer === q.correctAnswer;
      return `${idx + 1}. [${isCorrect ? '✓' : '✗'}] ${q.questionText.substring(0, 100)}...`;
    })
    .join('\n');

  const userPrompt = `Provide personalized feedback for this exam attempt:

Exam: ${params.examTitle}
Score: ${params.score}/${params.maxScore} (${params.percentage.toFixed(1)}%)
Performance Level: ${performanceLevel}

Question Results:
${questionSummary}

FEEDBACK REQUIREMENTS:
1. Start with a performance summary (2-3 sentences)
2. Highlight strengths based on correct answers
3. Identify knowledge gaps from incorrect answers
4. Provide 3-5 specific study recommendations
5. End with motivational encouragement
6. Use markdown formatting (headings, bullet points, bold)
7. Keep it concise (200-300 words)
8. Be supportive and constructive, never harsh

FORMAT:
Use markdown with sections:
- ## Performance Summary
- ## What You Did Well
- ## Areas to Focus On
- ## Study Recommendations
- ## Keep Going!

Generate the personalized feedback now:`;

  return {
    system: GRADING_SYSTEM_PROMPT,
    user: userPrompt,
  };
}

/**
 * Detailed explanation prompt for individual questions
 */
export function getQuestionExplanationPrompt(
  questionText: string,
  correctAnswer: string,
  userAnswer: string,
  questionType: QuestionType
): { system: string; user: string } {
  const system = `You are an expert tutor explaining why an answer is correct or incorrect. Be clear, concise, and educational.`;

  const user = `Explain this exam question result:

Question: ${questionText}
Question Type: ${questionType}
Correct Answer: ${correctAnswer}
Student's Answer: ${userAnswer}
Result: ${userAnswer === correctAnswer ? 'Correct' : 'Incorrect'}

Provide a brief explanation (2-3 sentences) that:
1. States why the correct answer is right
2. If incorrect, explains the student's mistake
3. Provides a learning point

Keep it concise and educational:`;

  return { system, user };
}

/**
 * Content analysis prompt (for PDF processing)
 */
export function getContentAnalysisPrompt(text: string): {
  system: string;
  user: string;
} {
  const system = `You are an expert content analyzer. Extract key topics and concepts from educational material.`;

  const user = `Analyze this educational content and extract:
1. Main topics (3-5 topics)
2. Key concepts (5-10 concepts)
3. Difficulty level (EASY, MEDIUM, HARD)
4. Recommended question count (based on content length)

Content:
"""
${text.substring(0, 4000)}
"""

Respond in JSON:
{
  "topics": ["topic1", "topic2", ...],
  "concepts": ["concept1", "concept2", ...],
  "suggestedDifficulty": "MEDIUM",
  "recommendedQuestions": 10
}`;

  return { system, user };
}
