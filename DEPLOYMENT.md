# ScoreX Production Deployment Guide

This guide explains how to deploy ScoreX using Docker images from GitHub Container Registry (GHCR).

## Architecture

```
GitHub Repository → GitHub Actions → Build Docker Image → Push to GHCR → Pull & Deploy
```

## Prerequisites

1. **GitHub Account** with the repository
2. **Docker** and **Docker Compose** installed on your server
3. **GitHub Personal Access Token** with `read:packages` scope

## Setup Instructions

### 1. Configure GitHub Repository

The repository is already configured with GitHub Actions workflow (`.github/workflows/docker-publish.yml`).

The workflow will automatically:
- Build a multi-platform Docker image (amd64 & arm64)
- Push to GHCR when you push to `main` branch
- Tag images with version numbers when you create tags

### 2. Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "ScoreX Deployment")
4. Select scopes:
   - `read:packages` (to pull Docker images)
   - `write:packages` (if you need to push manually)
5. Click "Generate token"
6. **Copy the token** - you'll need it for deployment

### 3. Prepare Environment Variables

Create a `.env` file on your deployment server:

```bash
# GitHub Configuration
GITHUB_USERNAME=your-github-username
GITHUB_TOKEN=ghp_your_personal_access_token

# Application Configuration
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
NEXTAUTH_URL=https://your-domain.com
OPENROUTER_API_KEY=sk-or-v1-your-api-key

# Database (optional - defaults are set in docker-compose)
DATABASE_URL=postgresql://scorex_user:scorex_password@postgres:5432/scorex_db
```

### 4. Deploy Using Script

Run the deployment script:

```bash
./deploy.sh
```

The script will:
1. ✅ Validate environment variables
2. 🔐 Login to GHCR
3. 📥 Pull the latest image
4. 🛑 Stop existing containers
5. 🗄️ Start database and run migrations
6. 🚀 Start all services

### 5. Manual Deployment

If you prefer manual deployment:

```bash
# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin

# Pull latest image
docker pull ghcr.io/${GITHUB_USERNAME}/scorex:latest

# Start services
docker-compose -f docker-compose.ghcr.yml up -d

# Run migrations (first time only)
docker-compose -f docker-compose.ghcr.yml exec scorex npx prisma migrate deploy
```

## Triggering a New Build

### Automatic (Recommended)

Push to main branch:
```bash
git add .
git commit -m "Update application"
git push origin main
```

GitHub Actions will automatically build and push a new image.

### Manual Trigger

You can also trigger the workflow manually from GitHub:
1. Go to Actions tab in your repository
2. Select "Build and Push Docker Image"
3. Click "Run workflow"

### Version Tags

Create a version tag to build a specific release:
```bash
git tag v1.0.0
git push origin v1.0.0
```

This creates images tagged as:
- `ghcr.io/username/scorex:v1.0.0`
- `ghcr.io/username/scorex:1.0`
- `ghcr.io/username/scorex:1`
- `ghcr.io/username/scorex:latest`

## Updating Deployment

To update to the latest version:

```bash
./deploy.sh
```

Or manually:
```bash
docker-compose -f docker-compose.ghcr.yml pull
docker-compose -f docker-compose.ghcr.yml up -d
```

## Monitoring

### View Logs
```bash
docker-compose -f docker-compose.ghcr.yml logs -f
```

### Check Service Status
```bash
docker-compose -f docker-compose.ghcr.yml ps
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-27T00:00:00.000Z",
  "services": {
    "database": "up",
    "api": "up"
  }
}
```

## Database Management

### Run Migrations
```bash
docker-compose -f docker-compose.ghcr.yml exec scorex npx prisma migrate deploy
```

### Backup Database
```bash
docker-compose -f docker-compose.ghcr.yml exec postgres pg_dump -U scorex_user scorex_db > backup.sql
```

### Restore Database
```bash
docker-compose -f docker-compose.ghcr.yml exec -T postgres psql -U scorex_user scorex_db < backup.sql
```

## Troubleshooting

### Image Pull Failed

If you get authentication errors:
```bash
# Re-login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
```

### Container Won't Start

Check logs:
```bash
docker-compose -f docker-compose.ghcr.yml logs scorex
```

### Database Connection Issues

Ensure database is running:
```bash
docker-compose -f docker-compose.ghcr.yml up -d postgres
docker-compose -f docker-compose.ghcr.yml exec postgres pg_isready -U scorex_user
```

## Security Notes

1. **Never commit `.env` file** - it contains secrets
2. **Use strong NEXTAUTH_SECRET** - minimum 32 characters
3. **Change database password** in production
4. **Use HTTPS** with proper SSL certificates
5. **Keep GitHub token secure** - treat it like a password

## Production Checklist

- [ ] GitHub Actions workflow tested
- [ ] GHCR authentication working
- [ ] `.env` file configured with production values
- [ ] Database backups scheduled
- [ ] HTTPS/SSL configured
- [ ] Domain name configured
- [ ] Monitoring and logging set up
- [ ] Health checks working
- [ ] Secret rotation plan in place

## Support

For issues or questions:
- Check logs: `docker-compose -f docker-compose.ghcr.yml logs`
- Review GitHub Actions logs for build issues
- Check health endpoint: `/api/health`
