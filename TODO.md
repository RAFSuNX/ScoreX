# ScoreX Development TODO List

## ✅ PHASE 1: Question Bank Infrastructure (COMPLETED)
- [x] Update database schema: Add QuestionBank model and modify Question model
- [x] Set up .env file for Docker deployment
- [x] Run Prisma migrations to apply schema changes
- [x] Build and deploy application with Docker Compose
- [x] Create API route: POST /api/question-bank (create/add questions)
- [x] Create API route: GET /api/question-bank (fetch questions by subject)
- [x] Create API route: PUT /api/questions/[id] (edit question)
- [x] Create API route: DELETE /api/questions/[id] (delete question)
- [x] Modify API route: /api/exams/create to support building from bank
- [x] Create QuestionEditor component for editing questions
- [x] Create QuestionBankBuilder component for selecting questions
- [x] Create Question Bank management page (/dashboard/bank)
- [x] Create UpgradeModal component with pricing comparison
- [x] Add UI gates and Pro badges to locked features

## ✅ PHASE 2: Enhanced Question Types (COMPLETED)
- [x] Database: Add FILL_IN_THE_BLANK to QuestionType enum
- [x] Backend: Update AI prompts to generate Fill-in-the-Blank questions
- [x] Backend: Update AI prompts to handle different question types
- [x] Frontend: Modify StepExamConfig.tsx to allow question type selection
- [x] Frontend: Add Pro badge to Fill-in-the-Blank option
- [x] Frontend: Update QuestionCard.tsx to render Fill-in-the-Blank questions
- [x] Frontend: Update QuestionCard.tsx to render True/False with radio buttons

## ✅ PHASE 3: Flashcard Mode (Pro Feature - COMPLETED)
- [x] Frontend: Create FlashcardPlayer component with flip animation
- [x] Frontend: Create /dashboard/exam/[id]/study page
- [x] Frontend: Add "Study with Flashcards" button to exam results page
- [x] Frontend: Add Pro badge and upgrade modal trigger for FREE users
- [x] Backend: Verify /api/exams/[id] returns all question data needed
- [x] Added 3D flip animation with CSS transforms
- [x] Implemented Know/Don't Know tracking for spaced repetition
- [x] Added shuffle and restart functionality

## ✅ PHASE 4: Export & Share Results (COMPLETED)
- [x] Frontend: Add "Share Link" button to exam results (copy URL to clipboard)
- [x] Backend: Create GET /api/exams/[id]/export-pdf endpoint
- [x] Implemented HTML-to-PDF export (browser print-friendly)
- [x] Frontend: Add "Download PDF" button to exam results (Pro only)
- [x] Frontend: Add Pro badge to PDF export button
- [x] Added Web Share API support for mobile devices

## 🚧 PHASE 5: Subscription Management (PENDING)
- [ ] Database: Add subscriptionId field to User model
- [ ] Database: Add subscriptionEnd field to User model
- [ ] Run migration for subscription fields

## 🚧 PHASE 6: Payment Integration (FUTURE)
- [ ] Backend: Create POST /api/payments/create-checkout endpoint
- [ ] Backend: Create POST /api/webhooks/stripe endpoint
- [ ] Backend: Integrate Stripe SDK
- [ ] Frontend: Connect upgrade buttons to checkout flow
- [ ] Frontend: Create subscription management page
- [ ] Frontend: Add billing history page

## 🚧 PHASE 7: Premium Features (FUTURE)
- [ ] Team collaboration & shared workspaces
- [ ] Student roster management
- [ ] Custom branding options
- [ ] LMS integrations (Canvas, Moodle)
- [ ] Priority support system

## 🧪 TESTING & VALIDATION
- [ ] Test Question Bank workflow end-to-end
- [ ] Test exam creation from question bank
- [ ] Test question editing and deletion
- [ ] Test upgrade modal and paywalls
- [ ] Verify plan enforcement on all protected routes
- [ ] Test different question types rendering
- [ ] Mobile responsiveness testing
- [ ] Accessibility audit

## 📝 DEFERRED TASKS
- [ ] Modify StepPreviewGenerate to add 'Review & Save to Bank' (needs post-generation UI)
- [ ] Add middleware protection for plan-based route access
- [ ] Performance optimization for large question banks
