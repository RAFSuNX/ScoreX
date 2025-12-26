# AI-Powered Learning SaaS - Implementation Plan

## Overview
Building an AI-powered education platform with exam generation, learning streaks, gamification, and personalized feedback using OpenRouter AI models.

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router with Server Components)
- **UI Library**: shadcn/ui + Tailwind CSS
- **Styling**: Glassmorphism design with Tailwind
- **State Management**: React Context + Server State
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js (email/password + future OAuth)
- **File Upload**: Uploadthing or custom S3-compatible storage
- **PDF Processing**: pdf-parse + langchain for text extraction

### AI Integration
- **Provider**: OpenRouter API
- **Model Strategy (Cost-optimized)**:
  - Exam/Question Generation: GPT-3.5-turbo or Claude Haiku (cheaper)
  - Answer Grading/Feedback: GPT-4 or Claude Sonnet (better quality)
  - Content Analysis: Mixtral or Llama (budget-friendly)

### Deployment
- **Platform**: K3s Kubernetes cluster (systema/systemb/systemc)
- **Containerization**: Docker
- **Reverse Proxy**: Cloudflare Tunnel (existing infrastructure)
- **Database**: PostgreSQL pod with persistent volume
- **Storage**: NFS/MergerFS for PDF uploads

## Database Schema (Prisma)

### Core Models

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String
  plan          Plan      @default(FREE)
  createdAt     DateTime  @default(now())

  exams         Exam[]
  attempts      ExamAttempt[]
  streak        Streak?
  stats         UserStats?
}

model Exam {
  id            String    @id @default(cuid())
  title         String
  description   String?
  userId        String
  user          User      @relation(fields: [userId], references: [id])

  sourceType    SourceType // PDF or DESCRIPTION
  sourcePdfUrl  String?
  sourceText    String?   @db.Text

  difficulty    Difficulty @default(MEDIUM)
  subject       String

  questions     Question[]
  attempts      ExamAttempt[]

  createdAt     DateTime  @default(now())
  aiModel       String    // Track which model generated it
}

model Question {
  id            String    @id @default(cuid())
  examId        String
  exam          Exam      @relation(fields: [examId], references: [id])

  questionText  String    @db.Text
  questionType  QuestionType // MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER

  options       Json?     // For multiple choice
  correctAnswer String    @db.Text
  explanation   String?   @db.Text

  points        Int       @default(1)
  order         Int
}

model ExamAttempt {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  examId        String
  exam          Exam      @relation(fields: [examId], references: [id])

  answers       Json      // User's answers
  score         Float
  maxScore      Float
  percentage    Float

  aiFeedback    String?   @db.Text
  timeSpent     Int       // seconds

  completedAt   DateTime  @default(now())
}

model Streak {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id])

  currentStreak Int       @default(0)
  longestStreak Int       @default(0)
  lastActiveDate DateTime @default(now())

  totalExams    Int       @default(0)
  totalQuestions Int      @default(0)
}

model UserStats {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id])

  totalExams    Int       @default(0)
  examsPassed   Int       @default(0)
  examsFailed   Int       @default(0)

  avgScore      Float     @default(0)
  totalTimeSpent Int      @default(0)

  subjectStats  Json      // Per-subject breakdown
}

enum Plan {
  FREE
  PRO
  PREMIUM
}

enum SourceType {
  PDF
  DESCRIPTION
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

enum QuestionType {
  MULTIPLE_CHOICE
  TRUE_FALSE
  SHORT_ANSWER
}
```

## Project Structure

```
saas/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/            # Auth routes group
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── dashboard/
│   │   │   ├── exams/
│   │   │   ├── create-exam/
│   │   │   ├── take-exam/[id]/
│   │   │   └── stats/
│   │   ├── (marketing)/       # Public routes
│   │   │   ├── page.tsx       # Landing page
│   │   │   ├── pricing/
│   │   │   └── about/
│   │   ├── api/               # API routes
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── exams/
│   │   │   ├── ai/
│   │   │   └── upload/
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   │   ├── stats-cards.tsx
│   │   │   ├── streak-calendar.tsx
│   │   │   └── subject-breakdown.tsx
│   │   ├── exam/
│   │   │   ├── exam-creator.tsx
│   │   │   ├── question-renderer.tsx
│   │   │   └── pdf-uploader.tsx
│   │   └── landing/
│   │       ├── hero-section.tsx
│   │       ├── features-section.tsx
│   │       └── pricing-section.tsx
│   │
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── openrouter.ts      # OpenRouter client
│   │   │   ├── exam-generator.ts  # AI exam generation logic
│   │   │   ├── grader.ts          # AI grading logic
│   │   │   └── prompts.ts         # AI prompt templates
│   │   ├── db/
│   │   │   └── prisma.ts
│   │   ├── pdf/
│   │   │   └── parser.ts
│   │   ├── auth/
│   │   │   └── config.ts
│   │   └── utils.ts
│   │
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
│
├── public/
│   ├── images/
│   └── fonts/
│
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
│
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── postgres.yaml
│   ├── pvc.yaml
│   └── ingress.yaml
│
├── .env.example
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Implementation Phases

### Phase 0: Lovable UI Generation (NEW!)
**Use Lovable premium subscription to generate all UI components**

1. **Landing Page Generation**:
   - Prompt Lovable to create diplomatic landing page with glassmorphism design
   - Include: Hero section, features, pricing table, testimonials, footer
   - Export React components

2. **Dashboard UI Generation**:
   - Prompt Lovable to create dashboard with glassmorphism sidebar
   - Include: Stats cards, streak calendar, subject breakdown charts
   - Include: Exam history table, recent activity timeline
   - Export all dashboard components

3. **Exam Creation UI Generation**:
   - Multi-step form for exam creation
   - PDF upload component with drag-and-drop
   - Text input option with rich editor
   - Difficulty and subject selection
   - Export exam creation components

4. **Exam Taking UI Generation**:
   - Exam interface with question renderer
   - Timer component with visual countdown
   - Progress bar and navigation
   - Results page with score visualization
   - Export exam-taking components

5. **Auth Pages Generation**:
   - Login/signup pages with glassmorphism cards
   - Form validation UI
   - Export auth components

**Lovable Prompts to Use**:
```
1. "Create a modern landing page for an AI-powered learning platform with glassmorphism design. Include hero section with gradient background, features section showcasing AI exam generation and learning streaks, pricing table with Free/Pro/Premium tiers, and a diplomatic footer. Use React, Tailwind CSS, and make it visually stunning."

2. "Design a dashboard for a learning app with glassmorphism sidebar. Include stat cards showing total exams, average score, current streak, and time spent. Add a heatmap-style streak calendar, subject performance pie chart, and exam history table. Make it modern and gamified like LeetCode. Use React and Tailwind."

3. "Create an exam creation wizard with steps: 1) Upload PDF or enter text, 2) Select difficulty and subject, 3) Preview generated questions. Include a beautiful PDF drag-and-drop uploader with progress indicator. Use glassmorphism design. React + Tailwind."

4. "Design an exam taking interface with question cards, multiple choice options, timer, and progress bar. Include a results page with score circle, AI feedback section, and performance breakdown. Glassmorphism style. React + Tailwind."

5. "Create login and signup pages with glassmorphism cards, email/password inputs, and social login buttons (Google, GitHub). Modern and beautiful. React + Tailwind."
```

### Phase 1: Project Setup & Core Infrastructure
1. Initialize Next.js 14 project with TypeScript
2. Set up Tailwind CSS + shadcn/ui
3. Configure Prisma with PostgreSQL connection
4. Set up NextAuth.js with email/password provider
5. **Import and integrate Lovable-generated components**
6. Adapt Lovable code to Next.js 14 App Router structure
7. Ensure glassmorphism styles match across all components

**Files to create**:
- `package.json` - Dependencies
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind + glassmorphism utilities (merge with Lovable config)
- `src/app/layout.tsx` - Root layout
- `src/lib/db/prisma.ts` - Prisma client
- `prisma/schema.prisma` - Database schema
- `.env.example` - Environment variables template
- `LOVABLE_INTEGRATION.md` - Document for tracking Lovable component imports

### Phase 2: Authentication System
1. Configure NextAuth.js with credentials provider
2. Create login/signup pages with form validation
3. Implement password hashing (bcrypt)
4. Create protected route middleware
5. Add user session management
6. Build user profile page

**Files to create**:
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth config
- `src/app/(auth)/login/page.tsx` - Login page
- `src/app/(auth)/signup/page.tsx` - Signup page
- `src/lib/auth/config.ts` - Auth configuration
- `src/middleware.ts` - Route protection

### Phase 3: Landing Page Integration (From Lovable)
1. **Import Lovable-generated landing page components**
2. Adapt to Next.js 14 App Router structure
3. Convert to Server Components where possible
4. Add SEO metadata and Open Graph tags
5. Ensure responsive design works properly
6. Test all interactive elements

**Files to adapt from Lovable**:
- `src/app/(marketing)/page.tsx` - Landing page (integrate Lovable code)
- `src/app/(marketing)/pricing/page.tsx` - Pricing page (integrate Lovable code)
- `src/components/landing/hero-section.tsx` - Import from Lovable
- `src/components/landing/features-section.tsx` - Import from Lovable
- `src/components/landing/pricing-section.tsx` - Import from Lovable
- `src/components/landing/testimonials.tsx` - Import from Lovable
- `src/components/landing/footer.tsx` - Import from Lovable

### Phase 4: Dashboard Integration & Backend Connection (From Lovable)
1. **Import Lovable-generated dashboard components**
2. Connect stats cards to real database via Prisma
3. Wire up streak calendar with actual user data
4. Connect subject breakdown charts to ExamAttempt data
5. Link exam history table to database
6. Add real-time data fetching with React Server Components
7. Implement loading states and error handling

**Files to adapt from Lovable**:
- `src/app/(dashboard)/dashboard/page.tsx` - Main dashboard (add data fetching)
- `src/components/dashboard/stats-cards.tsx` - Import from Lovable, add data props
- `src/components/dashboard/streak-calendar.tsx` - Import from Lovable, add data props
- `src/components/dashboard/subject-breakdown.tsx` - Import from Lovable, add data props
- `src/components/dashboard/exam-history.tsx` - Import from Lovable, add data props
- `src/app/api/dashboard/stats/route.ts` - NEW: API for dashboard data

### Phase 5: OpenRouter AI Integration
1. Set up OpenRouter client with API key
2. Create prompt templates for exam generation
3. Implement PDF text extraction
4. Build exam generation logic (questions from PDF/text)
5. Create grading logic with AI feedback
6. Add model selection based on task type

**Files to create**:
- `src/lib/ai/openrouter.ts` - OpenRouter client wrapper
- `src/lib/ai/exam-generator.ts` - Question generation
- `src/lib/ai/grader.ts` - Answer grading
- `src/lib/ai/prompts.ts` - Prompt templates
- `src/lib/pdf/parser.ts` - PDF processing

### Phase 6: Exam Creation Integration (From Lovable)
1. **Import Lovable-generated exam creation wizard**
2. Connect PDF uploader to actual file upload API
3. Wire up text input to AI generation backend
4. Integrate difficulty/subject selection with database
5. Connect AI generation progress to OpenRouter API
6. Link preview to actual Question model
7. Add form submission to save exam

**Files to adapt from Lovable**:
- `src/app/(dashboard)/create-exam/page.tsx` - Exam creator (add backend logic)
- `src/components/exam/pdf-uploader.tsx` - Import from Lovable, add upload handler
- `src/components/exam/exam-creator.tsx` - Import from Lovable, add state management
- `src/components/exam/exam-preview.tsx` - Import from Lovable
- `src/app/api/exams/create/route.ts` - NEW: API endpoint for exam creation
- `src/app/api/upload/route.ts` - NEW: File upload API

### Phase 7: Exam Taking Integration (From Lovable)
1. **Import Lovable-generated exam interface**
2. Connect question renderer to Question model
3. Wire up timer with state persistence
4. Connect progress indicator to answer tracking
5. Integrate submission with AI grading API
6. Link results page to ExamAttempt data
7. Add AI feedback display

**Files to adapt from Lovable**:
- `src/app/(dashboard)/take-exam/[id]/page.tsx` - Exam interface (add state management)
- `src/components/exam/question-renderer.tsx` - Import from Lovable, add answer handling
- `src/components/exam/timer.tsx` - Import from Lovable, add persistence
- `src/components/exam/progress-bar.tsx` - Import from Lovable
- `src/app/api/exams/submit/route.ts` - NEW: Submission & AI grading API
- `src/app/(dashboard)/results/[attemptId]/page.tsx` - Import from Lovable, add data fetching

### Phase 8: Streak & Gamification
1. Implement daily streak tracking logic
2. Create streak calendar visualization
3. Add badge/achievement system
4. Build leaderboard (optional)
5. Create progress milestones
6. Add celebration animations

**Files to create**:
- `src/lib/streak/calculator.ts` - Streak logic
- `src/components/dashboard/streak-calendar.tsx`
- `src/components/gamification/badges.tsx`
- `src/app/api/streak/update/route.ts` - Streak API

### Phase 9: Freemium & Limits
1. Implement usage tracking (exams/month)
2. Create plan upgrade prompts
3. Build pricing page with plan comparison
4. Add payment integration (Stripe/LemonSqueezy)
5. Implement feature gating based on plan
6. Create subscription management page

**Files to create**:
- `src/lib/limits/checker.ts` - Usage limit logic
- `src/app/(dashboard)/upgrade/page.tsx` - Upgrade page
- `src/app/api/stripe/webhook/route.ts` - Payment webhook
- `src/lib/payments/stripe.ts` - Stripe integration

### Phase 10: Deployment to K3s
1. Create Dockerfile for Next.js app
2. Build Docker image
3. Create PostgreSQL deployment in K3s
4. Set up persistent volumes for database
5. Create app deployment with environment variables
6. Configure Cloudflare Tunnel ingress
7. Set up secrets management
8. Implement health checks

**Files to create**:
- `docker/Dockerfile` - Container definition
- `k8s/deployment.yaml` - K8s app deployment
- `k8s/postgres.yaml` - Database deployment
- `k8s/pvc.yaml` - Persistent volume claims
- `k8s/service.yaml` - Service definitions
- `k8s/ingress.yaml` - Cloudflare tunnel config
- `k8s/secrets.yaml` - Secrets (excluded from git)

## Key Features Details

### Glassmorphism Design System
- Semi-transparent backgrounds with backdrop blur
- Subtle shadows and borders
- Gradient accents
- Smooth animations and transitions
- Custom Tailwind utilities:
  ```css
  .glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  ```

### AI Exam Generation Flow
1. User uploads PDF or provides description
2. Extract text content using pdf-parse
3. Send to OpenRouter (GPT-3.5/Haiku) with prompt:
   - "Generate 10 multiple choice questions from this content..."
4. Parse AI response into structured questions
5. Store in database with exam metadata
6. Allow manual editing before finalization

### AI Grading System
1. User submits exam answers
2. For each question:
   - Multiple choice: Direct comparison
   - Short answer: Send to OpenRouter (GPT-4/Sonnet) for evaluation
3. Generate overall feedback and suggestions
4. Calculate score and update user stats
5. Update streak if exam completed today

### Learning Streak Logic
- Track last active date
- If user completes exam today: increment streak
- If last active was yesterday: maintain streak
- If gap > 1 day: reset to 1
- Update longest streak if current > longest

### Stats Dashboard Components
1. **Overview Cards**: Total exams, avg score, current streak, time spent
2. **Subject Breakdown**: Pie/bar chart showing performance by subject
3. **Recent Activity**: Timeline of recent exams and scores
4. **Streak Calendar**: Heatmap-style calendar showing daily activity
5. **Progress Trends**: Line chart showing score improvement over time

## Environment Variables Required

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/learnai"

# NextAuth
NEXTAUTH_URL="https://yourapp.yourdomain.com"
NEXTAUTH_SECRET="generate-random-secret"

# OpenRouter
OPENROUTER_API_KEY="your-openrouter-key"

# Models (cost-optimized)
AI_MODEL_GENERATION="openai/gpt-3.5-turbo"
AI_MODEL_GRADING="openai/gpt-4-turbo-preview"
AI_MODEL_ANALYSIS="mistralai/mixtral-8x7b-instruct"

# File Upload
UPLOAD_DIR="/storage/merged/uploads"
MAX_FILE_SIZE="10485760" # 10MB

# Features
FREE_TIER_EXAM_LIMIT="5"
PRO_TIER_EXAM_LIMIT="50"

# Optional
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

## Critical Dependencies

```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.8.0",
    "next-auth": "^4.24.5",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.4",
    "react-hook-form": "^7.49.3",
    "@hookform/resolvers": "^3.3.4",
    "pdf-parse": "^1.1.1",
    "axios": "^1.6.5",
    "date-fns": "^3.2.0",
    "recharts": "^2.10.3",
    "lucide-react": "^0.309.0",
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^3.4.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "prisma": "^5.8.0",
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/bcryptjs": "^2.4.6"
  }
}
```

## Deployment Strategy

### Local Development
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Docker Build
```bash
docker build -t learnai-saas:latest -f docker/Dockerfile .
docker push your-registry/learnai-saas:latest
```

### K3s Deployment
```bash
# Create namespace
kubectl create namespace learnai

# Apply database
kubectl apply -f k8s/postgres.yaml -n learnai

# Wait for DB ready
kubectl wait --for=condition=ready pod -l app=postgres -n learnai

# Run migrations
kubectl run migrations --image=learnai-saas:latest --command -- npx prisma migrate deploy

# Deploy app
kubectl apply -f k8s/deployment.yaml -n learnai
kubectl apply -f k8s/service.yaml -n learnai

# Configure Cloudflare tunnel
kubectl apply -f k8s/ingress.yaml -n learnai
```

## Success Metrics

### MVP Goals
- User can sign up and log in
- User can upload PDF and generate exam
- User can take exam and get AI-graded results
- Dashboard shows streak and stats
- Glassmorphism UI is visually appealing
- Free tier limit enforcement works
- Deployed successfully on K3s cluster

### Performance Targets
- Landing page load: < 2s
- Exam generation: < 30s (depends on PDF size)
- Exam submission & grading: < 10s
- Dashboard load: < 1s

## Risks & Mitigation

1. **OpenRouter API Costs**:
   - Mitigation: Implement strict rate limiting, cache where possible, use cheaper models for generation

2. **PDF Processing Complexity**:
   - Mitigation: Start with simple PDFs, add error handling, provide fallback text input

3. **AI Generation Quality**:
   - Mitigation: Allow manual editing, provide prompt refinement, use better models for critical tasks

4. **Database Performance**:
   - Mitigation: Add indexes on frequently queried fields, implement pagination

5. **K3s Storage for PDFs**:
   - Mitigation: Use NFS/MergerFS as specified, implement cleanup for old files

## Lovable Integration Workflow

### Step 1: Generate UI in Lovable
1. Log into Lovable (lovable.dev) with premium account
2. Create 5 separate projects (one for each major section):
   - **Project 1**: Landing Page
   - **Project 2**: Dashboard
   - **Project 3**: Exam Creation
   - **Project 4**: Exam Taking
   - **Project 5**: Auth Pages

3. Use the prompts provided in Phase 0 above
4. Iterate on design until glassmorphism looks perfect
5. Test responsive design in Lovable preview

### Step 2: Export Code from Lovable
1. For each Lovable project, click "Export" or "Download"
2. Download the full React code (components, styles, assets)
3. Save to a temporary folder: `lovable-exports/landing/`, `lovable-exports/dashboard/`, etc.

### Step 3: Integrate into Next.js
1. **Copy Components**:
   ```bash
   # From lovable-exports to src/components
   cp -r lovable-exports/landing/components/* src/components/landing/
   cp -r lovable-exports/dashboard/components/* src/components/dashboard/
   # etc.
   ```

2. **Merge Tailwind Config**:
   - Take glassmorphism utilities from Lovable's tailwind.config
   - Add to our `tailwind.config.ts`
   - Ensure color schemes match

3. **Adapt to App Router**:
   - Convert pages to Next.js 14 app directory structure
   - Change imports from relative to absolute (@/components/...)
   - Add "use client" directive where needed
   - Convert static pages to Server Components

4. **Add Data Props**:
   - Identify where components need dynamic data
   - Add TypeScript interfaces for props
   - Connect to database via Prisma

### Step 4: Connect Backend Logic
1. Keep Lovable UI components pure (presentation only)
2. Create separate "container" components that fetch data
3. Pass data down to Lovable components as props
4. Example:
   ```tsx
   // src/app/(dashboard)/dashboard/page.tsx
   async function DashboardPage() {
     const stats = await fetchUserStats(); // Our backend logic
     return <DashboardUI stats={stats} />; // Lovable component
   }
   ```

### Benefits of This Approach
- **Speed**: Lovable generates beautiful UI in minutes
- **Quality**: Premium subscription ensures high-quality designs
- **Separation**: UI (Lovable) separate from business logic (our code)
- **Flexibility**: Easy to iterate on design without touching backend
- **Professional**: Glassmorphism done right by AI design expert

### Potential Challenges & Solutions
1. **Challenge**: Lovable uses different folder structure
   - **Solution**: Reorganize during import, use adapters if needed

2. **Challenge**: Lovable might use different component libraries
   - **Solution**: Stick with shadcn/ui, replace any conflicting components

3. **Challenge**: State management differences
   - **Solution**: Extract Lovable components as "dumb components", manage state in Next.js pages

4. **Challenge**: Animation libraries might conflict
   - **Solution**: Standardize on Framer Motion or remove animations if needed

## Next Steps After Plan Approval

1. **Start with Lovable** (Phase 0):
   - Generate landing page first
   - Export and test integration workflow
   - Once workflow is smooth, generate remaining UI

2. Initialize Next.js project with TypeScript
3. Import first Lovable components (landing page)
4. Install and configure all dependencies
5. Set up Prisma with initial schema
6. Continue with authentication, then dashboard
7. Proceed phase by phase as outlined above
