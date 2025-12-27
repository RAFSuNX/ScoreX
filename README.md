# ScoreX - AI-Powered Exam Generation Platform

ScoreX is a Next.js application that generates exams and questions using AI, with features for exam tracking, analytics, and user management.

## Features

- **AI-Powered Exam Generation**: Generate questions from text or PDF documents
- **User Authentication**: Secure authentication with NextAuth.js
- **Exam Management**: Create, take, and track exams
- **Progress Tracking**: Save exam progress and continue later
- **Analytics Dashboard**: View performance statistics and insights
- **Plan-Based Quotas**: Different limits for FREE, PRO, and PREMIUM users
- **Real-time Feedback**: AI-generated feedback on exam submissions

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **AI Integration**: OpenRouter API
- **Deployment**: Docker, Docker Compose, Kubernetes-ready

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL 14.x or higher
- Docker and Docker Compose (for containerized deployment)
- OpenRouter API key (get from https://openrouter.ai/keys)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd ScoreX
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and update it with your values:

```bash
cp .env.example .env
```

**Required Environment Variables:**

```bash
# Database
DATABASE_URL="postgresql://scorex_user:your_password@localhost:5432/scorex_db"

# Authentication
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# AI API
OPENROUTER_API_KEY="sk-or-v1-your-api-key-here"

# Optional
AI_MODEL_GENERATION="openai/gpt-3.5-turbo"
NODE_ENV="development"
```

### 4. Set up the database

```bash
# Run migrations
npx prisma migrate deploy

# (Optional) Seed the database
npx prisma db seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Production Deployment

### Docker Deployment

#### Using Docker Compose (Recommended)

1. **Set up production environment variables**

```bash
cp .env.example .env
# Edit .env with your production values
```

2. **Build and run with Docker Compose**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

This will:
- Build the application image
- Start PostgreSQL database
- Run database migrations automatically
- Start the application on port 3000

3. **View logs**

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

4. **Stop the application**

```bash
docker-compose -f docker-compose.prod.yml down
```

#### Using Docker directly

1. **Build the image**

```bash
docker build -t scorex:latest .
```

2. **Run the container**

```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="your-domain" \
  -e OPENROUTER_API_KEY="your-api-key" \
  --name scorex \
  scorex:latest
```

### Kubernetes Deployment

The GitHub Actions workflow automatically builds and pushes Docker images to GitHub Container Registry (ghcr.io).

1. **Pull the latest image**

```bash
docker pull ghcr.io/<your-username>/scorex:latest
```

2. **Apply Kubernetes manifests**

Create your Kubernetes manifests (deployment, service, ingress) and apply them:

```bash
kubectl apply -f k8s/
```

See `DEPLOYMENT.md` for detailed Kubernetes deployment instructions.

### Environment Variables for Production

Ensure these are set in your production environment:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Yes | Secret for NextAuth.js (min 32 chars) | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Your application URL | `https://your-domain.com` |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key | `sk-or-v1-...` |
| `AI_MODEL_GENERATION` | No | AI model to use | `openai/gpt-3.5-turbo` |
| `NODE_ENV` | Yes | Node environment | `production` |

## Security Features

- **Rate Limiting**: Protects against brute force and DDoS attacks
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **Strong Password Policy**: Minimum 8 characters with complexity requirements
- **Environment Validation**: Runtime validation of all environment variables
- **Database Migrations**: Automatic migrations on container startup
- **Non-root Container**: Runs as unprivileged user (UID 1001)

## API Routes

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out

### Exams
- `GET /api/exams` - List user's exams
- `POST /api/exams/create` - Create new exam
- `GET /api/exams/[id]` - Get exam details
- `POST /api/exams/upload-pdf` - Upload PDF for exam
- `POST /api/exams/[id]/submit` - Submit exam
- `POST /api/exams/[id]/save-progress` - Save progress

### AI
- `POST /api/ai/generate` - Generate questions from text

### Stats
- `GET /api/stats/overview` - User statistics overview
- `GET /api/stats/subjects` - Subject-wise statistics
- `GET /api/stats/attempts` - Exam attempts history

## Database Schema

The application uses Prisma ORM with PostgreSQL. Key models:

- **User**: User accounts with plan-based quotas
- **Exam**: Exam definitions with source material
- **Question**: Individual questions for exams
- **ExamAttempt**: User exam sessions with progress tracking
- **UserStats**: Aggregated user statistics
- **Streak**: User activity streaks

## Development

### Running tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Database management

```bash
# Create a new migration
npx prisma migrate dev --name migration-name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Monitoring & Logging

The application includes structured logging:

- All API requests/responses are logged
- Errors include stack traces in development
- Production logs are JSON-formatted for easy parsing
- Health check endpoint: `GET /api/health`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Your License Here]

## Support

For issues and questions, please open an issue on GitHub.
