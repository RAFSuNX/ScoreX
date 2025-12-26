#!/bin/bash

# ScoreX Deployment Script
# This script deploys ScoreX using the Docker image from GHCR

set -e

echo "ScoreX Production Deployment"
echo "================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "[ERROR] .env file not found"
    echo "Please create .env file with required variables:"
    echo "  - NEXTAUTH_SECRET"
    echo "  - OPENROUTER_API_KEY"
    echo "  - NEXTAUTH_URL"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check required variables
if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "[ERROR] NEXTAUTH_SECRET not set in .env"
    exit 1
fi

if [ -z "$OPENROUTER_API_KEY" ]; then
    echo "[ERROR] OPENROUTER_API_KEY not set in .env"
    exit 1
fi

echo "[OK] Environment variables loaded"

# Pull latest image
echo "[INFO] Pulling latest image from GHCR..."
docker pull ghcr.io/rafsunx/scorex:latest

echo "[OK] Image pulled successfully"

# Stop existing containers
echo "[INFO] Stopping existing containers..."
docker-compose -f docker-compose.ghcr.yml down

# Start all services
echo "[INFO] Starting all services..."
docker-compose -f docker-compose.ghcr.yml up -d

# Wait for services to be healthy
echo "[INFO] Waiting for services to be healthy..."
sleep 10

echo ""
echo "[SUCCESS] Deployment complete!"
echo ""
echo "Service Status:"
docker-compose -f docker-compose.ghcr.yml ps
echo ""
echo "ScoreX is now running at: http://localhost:3000"
echo "Health check: http://localhost:3000/api/health"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose -f docker-compose.ghcr.yml logs -f"
echo "  - Stop services: docker-compose -f docker-compose.ghcr.yml down"
echo "  - Restart services: docker-compose -f docker-compose.ghcr.yml restart"
echo "  - Update to latest: ./deploy.sh"
