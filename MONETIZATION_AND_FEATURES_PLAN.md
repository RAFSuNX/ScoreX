# ScoreX: Monetization and Feature Implementation Plan

## 1.0 Overview

This document outlines the strategic plan for implementing monetization and essential new features for the ScoreX platform. The goal is to establish a clear path to revenue by adopting a Freemium SaaS model and enhancing the product's core value proposition.

The strategy is based on three tiers: **Free**, **Pro**, and **Premium**. This plan details the features within each tier and provides a technical roadmap for implementation. The integration of a payment provider (like Stripe) is considered a separate, subsequent step; this plan focuses on building the necessary infrastructure and feature gates.

## 2.0 Monetization Tiers

### 2.1 FREE Plan (The Hook)

-   **Target Audience:** Casual users, students trying out the platform.
-   **Price Point:** $0
-   **Goal:** Maximize user sign-ups and demonstrate the core value of AI exam generation.
-   **Features & Limits:**
    -   **Exam Generation:** Up to 3 exams per month.
    -   **Question Limit:** Up to 15 questions per exam.
    -   **Source Input:** Text input only.
    -   **Question Types:** Multiple Choice, True/False.
    -   **Gamification:** Full access (Achievements, Streaks, Leaderboards).
    -   **Analytics:** Basic score history.
    -   **Branding:** "Made with ScoreX" watermark on any outputs.
    -   **Sharing:** Share results via a public link.

### 2.2 PRO Plan (The Workhorse)

-   **Target Audience:** Educators, dedicated students, tutors, small businesses.
-   **Price Point:** $15 - $25 / month (Est.)
-   **Goal:** Convert engaged free users into paying customers by offering powerful features for learning and content creation.
-   **Features & Limits (Includes everything in Free, plus):**
    -   **Exam Generation:** Up to 50 exams per month.
    -   **Question Limit:** Up to 50 questions per exam.
    -   **Source Input:** PDF uploads (up to 20 pages), larger text inputs.
    -   **Question Types:** Adds **Fill-in-the-Blank** and **Short Answer** questions.
    -   **[NEW] Flashcard Mode:** Study generated questions as interactive flashcards.
    -   **[NEW] Question Bank:** Save up to 500 questions in a personal bank for reuse.
    -   **[NEW] Manual Editing:** Edit AI-generated questions before finalizing an exam.
    -   **Advanced Analytics:** Access to performance dashboards, trend analysis, and improvement tracking.
    -   **Branding:** No watermarks.
    -   **[NEW] Export Results:** Export exam results as a formatted PDF.

### 2.3 PREMIUM Plan (The Powerhouse)

-   **Target Audience:** Educational institutions, corporate training departments.
-   **Price Point:** $50 - $100+ / month or custom enterprise pricing (Est.)
-   **Goal:** Capture the high-end B2B market with administrative and collaborative tools.
-   **Features & Limits (Includes everything in Pro, plus):**
    -   **Exam Generation:** Unlimited.
    -   **Question Limit:** Unlimited.
    -   **Source Input:** Large PDF uploads (100+ pages).
    -   **Question Bank:** Unlimited questions.
    -   **Team Collaboration:** Invite other users to a shared workspace to co-create exams and view results.
    -   **Student Management:** Assign exams to a roster of students and track their progress from a central dashboard.
    -   **Custom Branding:** Add a custom logo to the exam interface.
    -   **LMS Integrations:** API/connector for systems like Canvas or Moodle.

---

## 3.0 New Feature Implementation Plan

### 3.1 Feature: Question Bank & Manual Editing

-   **Description:** Allows creators to save, review, edit, and reuse AI-generated questions. This transforms the tool from a generator into a content management system.
-   **User Flow:**
    1.  After AI generates questions, the user sees a "Review & Save to Bank" screen.
    2.  On this screen, they can edit the text of any question or its answers.
    3.  The user selects which questions to save to their "Question Bank" for the exam's subject.
    4.  Later, when creating an exam, they can choose "Build from Bank" to manually select questions.
-   **Technical Implementation Steps:**
    1.  **Database (`prisma/schema.prisma`):**
        -   Create a new model:
            ```prisma
            model QuestionBank {
              id        String     @id @default(cuid())
              userId    String
              user      User       @relation(fields: [userId], references: [id])
              subject   String
              questions Question[]
              createdAt DateTime   @default(now())
              updatedAt DateTime   @updatedAt
            }
            ```
        -   Modify the `Question` model to link it to a `QuestionBank` instead of directly to an `Exam`. An exam will then be composed of questions from the bank.
    2.  **Backend (API Routes):**
        -   `POST /api/question-bank`: Create a new bank or add questions to it.
        -   `PUT /api/questions/{id}`: New endpoint to handle editing of a specific question.
        -   `GET /api/question-bank/{subject}`: Fetch questions from the bank for a user and subject.
        -   Modify `/api/exams/create` to accept a list of question IDs from the bank.
    3.  **Frontend (Components):**
        -   **New Page (`/dashboard/bank`):** A new page to view and manage all question banks.
        -   **New Component (`<QuestionEditor />`):** A modal or inline editor to modify a question and its answers.
        -   **New Component (`<QuestionBankBuilder />`):** A UI for selecting questions from the bank to add to a new exam.
        -   **Modify `StepPreviewGenerate.tsx`:** Change this step to be the "Review & Save to Bank" screen.

### 3.2 Feature: Flashcard Mode

-   **Description:** Allows learners to study questions from an exam in an interactive flashcard format.
-   **User Flow:**
    1.  On an exam results page or exam history page, the user sees a "Study with Flashcards" button.
    2.  Clicking it opens a full-screen modal or a new page.
    3.  The UI displays one question at a time. Clicking the card "flips" it to reveal the correct answer and explanation.
    4.  The user can navigate through all questions in the exam.
-   **Technical Implementation Steps:**
    1.  **Database:** No schema changes are required as it uses existing `Exam` and `Question` data.
    2.  **Backend (API Routes):**
        -   Modify the `/api/exams/{id}` endpoint to ensure it can be called by a Pro user and returns all necessary question data (question, options, answer, explanation).
    3.  **Frontend (Components):**
        -   **New Page or Component (`/dashboard/exam/{id}/study` or `<FlashcardPlayer />`):**
            -   Fetches exam data.
            -   Manages the state of the current card index and its "flipped" status.
            -   Uses animation for the card flip (e.g., `transform: rotateY(180deg)`).
            -   Add a button to the exam results page (`/dashboard/exam/[id]/review/page.tsx`) that links to this new study mode. This button should be disabled with a tooltip for Free users.

### 3.3 Feature: More Question Types

-   **Description:** Extend the AI's capability to generate True/False, Fill-in-the-Blank, and Short Answer questions.
-   **User Flow:**
    1.  In the exam creation wizard (`StepExamConfig.tsx`), the user can select the desired question types.
    2.  The AI generates a mix of the selected types.
    3.  When taking the exam, the UI (`QuestionCard.tsx`) adapts to render the appropriate input (radio buttons for T/F, text input for fill-in-the-blank, textarea for short answer).
-   **Technical Implementation Steps:**
    1.  **Database (`prisma/schema.prisma`):**
        -   Add a `type` field to the `Question` model:
            ```prisma
            enum QuestionType {
              MULTIPLE_CHOICE
              TRUE_FALSE
              FILL_IN_THE_BLANK
              SHORT_ANSWER
            }

            model Question {
              // ... existing fields
              type QuestionType @default(MULTIPLE_CHOICE)
            }
            ```
    2.  **Backend (AI Prompts):**
        -   Update `src/lib/ai/prompts.ts`. The `getExamGenerationPrompt` function must be modified to include instructions for generating the newly selected types in its system prompt.
        -   The prompt should specify the exact format for each new type in the JSON output.
    3.  **Frontend (Components):**
        -   **Modify `StepExamConfig.tsx`:** Update the UI to allow selection of the new question types. Gate the Pro types for free users.
        -   **Modify `QuestionCard.tsx`:** Add conditional rendering logic. Based on `question.type`, render either the existing multiple-choice options, a True/False radio group, or a text input field.

### 3.4 Feature: Export/Share Results

-   **Description:** Allow users to share a link to their results or download a PDF.
-   **User Flow:** On the exam results page, the user sees a "Share" button. Clicking it reveals options to "Copy Link" or "Download PDF".
-   **Technical Implementation Steps:**
    1.  **Sharing (Free):** The results page (`/dashboard/exam/[id]/review/page.tsx`) is already a unique URL. This is simple to implement. Add a "Copy Link" button that copies the current URL to the clipboard.
    2.  **PDF Export (Pro):**
        -   **Backend (API Route):** Create a new endpoint `GET /api/exams/{id}/export-pdf`.
        -   This endpoint will re-use the data fetching from the review page.
        -   Use a library like `puppeteer` or `playwright` on the server to render the review page in a headless browser and save it as a PDF. (Note: This is resource-intensive).
        -   Alternatively, use a library like `react-pdf/renderer` to create a PDF document from scratch using the data. This is more efficient.
        -   **Frontend:** The "Download PDF" button will make a request to this endpoint. The button should be disabled for Free users.

---

## 4.0 Monetization Implementation Plan

### 4.1 User Plan & Subscription Status

1.  **Database (`prisma/schema.prisma`):**
    -   Modify the `User` model to track the current plan and subscription status. The `Plan` enum already exists.
        ```prisma
        model User {
          // ... existing fields
          plan             Plan          @default(FREE)
          subscriptionId   String?       @unique
          subscriptionEnd  DateTime?
        }
        ```

### 4.2 Enforcement & Paywalls

1.  **Middleware (`src/middleware.ts`):**
    -   Fetch the user's session and plan on every request to a protected route (e.g., `/dashboard/create`).
    -   Before allowing access, check their usage against the limits for their plan (e.g., exam count).
    -   If a limit is reached, redirect them to an upgrade page or return a specific status code that the frontend can use to trigger an upgrade modal.

2.  **API Routes:**
    -   Protect feature-specific endpoints. For example, the `/api/exams/upload-pdf` route should check `session.user.plan` and return a 403 Forbidden error if the user is on the Free plan.

3.  **Frontend (UI Paywalls):**
    -   **`UpgradeModal.tsx` (New Component):** A reusable modal that can be triggered from anywhere in the app. It should display a clear message about the feature being locked and show a comparison of the Free and Pro plans to encourage an upgrade.
    -   **Conditional Rendering:** In components like `StepSourceSelection.tsx` (for PDF upload) or the exam history (for Flashcards), check the user's plan. If they are `FREE`, disable the feature and show a tooltip or a small "Pro" badge that triggers the `UpgradeModal` on click.

### 4.3 Payment Flow (Placeholders)

This section is for planning purposes and does not require immediate implementation.

1.  **Backend (API Routes):**
    -   `POST /api/payments/create-checkout`: This endpoint will be called when a user clicks "Upgrade". It will use a payment provider's SDK (e.g., Stripe) to create a checkout session and return the session URL.
    -   `POST /api/webhooks/payment-provider`: This will be the webhook endpoint that listens for events from the payment provider (e.g., `checkout.session.completed`). When a successful payment event is received, it will update the user's record in the database (e.g., set `plan` to `PRO`, and save the `subscriptionId` and `subscriptionEnd` date).
2.  **Frontend:**
    -   The "Upgrade" button in `Pricing.tsx` and `UpgradeModal.tsx` will call the `/api/payments/create-checkout` endpoint and redirect the user to the returned URL.
