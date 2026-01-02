import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user has PRO or PREMIUM plan
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    if (user?.plan === "FREE") {
      return NextResponse.json(
        { message: "PDF Export is a Pro feature. Please upgrade your plan." },
        { status: 403 }
      );
    }

    const examId = params.id;

    // Fetch exam with questions and latest attempt
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        attempts: {
          where: {
            userId: session.user.id,
            status: "COMPLETED",
          },
          orderBy: {
            completedAt: "desc",
          },
          take: 1,
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 });
    }

    if (exam.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const latestAttempt = exam.attempts[0];

    if (!latestAttempt) {
      return NextResponse.json(
        { message: "No completed attempts found" },
        { status: 404 }
      );
    }

    // Generate HTML for PDF
    const html = generatePDFHTML(exam, latestAttempt, session.user.name || "User");

    // Return HTML with print-friendly styling
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${exam.title.replace(/[^a-z0-9]/gi, "_")}_Results.html"`,
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { message: "Failed to export PDF" },
      { status: 500 }
    );
  }
}

function generatePDFHTML(exam: any, attempt: any, userName: string): string {
  const submittedAnswers = (attempt.submittedAnswers || {}) as Record<string, string>;

  const questionsHTML = exam.questions
    .map((q: any, index: number) => {
      const userAnswer = submittedAnswers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;

      return `
        <div class="question-block">
          <div class="question-header">
            <strong>Question ${index + 1}</strong>
            <span class="badge ${isCorrect ? "correct" : "incorrect"}">
              ${isCorrect ? "✓ Correct" : "✗ Incorrect"}
            </span>
          </div>
          <p class="question-text">${q.questionText}</p>

          ${q.questionType === "MULTIPLE_CHOICE" && q.options ? `
            <div class="options">
              <p><strong>Options:</strong></p>
              <ul>
                ${Object.entries(q.options as Record<string, string>)
                  .map(
                    ([key, value]) => `
                  <li class="${key === q.correctAnswer ? "correct-option" : ""}">
                    ${value}
                  </li>
                `
                  )
                  .join("")}
              </ul>
            </div>
          ` : ""}

          <div class="answer-section">
            <p><strong>Your Answer:</strong> ${userAnswer || "Not answered"}</p>
            <p><strong>Correct Answer:</strong> ${q.correctAnswer}</p>
            ${q.explanation ? `<p class="explanation"><strong>Explanation:</strong> ${q.explanation}</p>` : ""}
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${exam.title} - Results</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          .page-break { page-break-before: always; }
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f5f5f5;
          padding: 20px;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #8b5cf6;
        }

        .header h1 {
          font-size: 32px;
          color: #8b5cf6;
          margin-bottom: 10px;
        }

        .header .subtitle {
          color: #666;
          font-size: 14px;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .summary-item {
          text-align: center;
        }

        .summary-item .label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }

        .summary-item .value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }

        .summary-item .value.score {
          color: ${attempt.percentage >= 70 ? "#10b981" : attempt.percentage >= 50 ? "#f59e0b" : "#ef4444"};
        }

        .questions-section {
          margin-top: 40px;
        }

        .questions-section h2 {
          font-size: 24px;
          margin-bottom: 20px;
          color: #333;
        }

        .question-block {
          margin-bottom: 30px;
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fafafa;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge.correct {
          background: #d1fae5;
          color: #065f46;
        }

        .badge.incorrect {
          background: #fee2e2;
          color: #991b1b;
        }

        .question-text {
          font-size: 16px;
          margin-bottom: 15px;
          font-weight: 500;
        }

        .options {
          margin: 15px 0;
        }

        .options ul {
          list-style: none;
          padding: 0;
        }

        .options li {
          padding: 8px 12px;
          margin: 5px 0;
          background: white;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }

        .options li.correct-option {
          background: #d1fae5;
          border-color: #10b981;
          font-weight: 500;
        }

        .answer-section {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
        }

        .answer-section p {
          margin: 8px 0;
          font-size: 14px;
        }

        .explanation {
          margin-top: 10px;
          padding: 12px;
          background: #eff6ff;
          border-left: 3px solid #3b82f6;
          font-style: italic;
          color: #1e40af;
        }

        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #666;
          font-size: 12px;
        }

        .print-button {
          display: block;
          margin: 20px auto;
          padding: 12px 24px;
          background: #8b5cf6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }

        .print-button:hover {
          background: #7c3aed;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <button class="print-button no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>

        <div class="header">
          <h1>${exam.title}</h1>
          <p class="subtitle">Exam Results Report • Generated by ScoreX</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="label">Student</div>
            <div class="value">${userName}</div>
          </div>
          <div class="summary-item">
            <div class="label">Score</div>
            <div class="value score">${attempt.percentage.toFixed(1)}%</div>
          </div>
          <div class="summary-item">
            <div class="label">Points</div>
            <div class="value">${attempt.score}/${attempt.maxScore}</div>
          </div>
          <div class="summary-item">
            <div class="label">Time</div>
            <div class="value">${Math.floor(attempt.timeSpent / 60)}m ${attempt.timeSpent % 60}s</div>
          </div>
          <div class="summary-item">
            <div class="label">Subject</div>
            <div class="value">${exam.subject}</div>
          </div>
          <div class="summary-item">
            <div class="label">Difficulty</div>
            <div class="value">${exam.difficulty}</div>
          </div>
        </div>

        <div class="questions-section">
          <h2>Detailed Results</h2>
          ${questionsHTML}
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>Powered by ScoreX - AI-Powered Exam Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
