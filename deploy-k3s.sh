#!/bin/bash
set -e

echo "===== ScoreX K3s Deployment Script ====="
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl not found. Please install kubectl first."
    exit 1
fi

# Check K3s cluster connectivity
echo "Checking K3s cluster connectivity..."
if ! kubectl cluster-info &> /dev/null; then
    echo "Error: Cannot connect to K3s cluster. Please check your kubeconfig."
    exit 1
fi
echo "✓ Connected to K3s cluster"
echo ""

# Prompt for secrets
echo "Please provide the following secrets:"
echo ""

read -p "NEXTAUTH_SECRET (press Enter to auto-generate): " NEXTAUTH_SECRET
if [ -z "$NEXTAUTH_SECRET" ]; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "✓ Generated NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
fi

read -p "NEXTAUTH_URL (e.g., https://your-domain.com): " NEXTAUTH_URL
if [ -z "$NEXTAUTH_URL" ]; then
    NEXTAUTH_URL="http://localhost:3000"
    echo "Using default: $NEXTAUTH_URL"
fi

read -p "OPENROUTER_API_KEY: " OPENROUTER_API_KEY
if [ -z "$OPENROUTER_API_KEY" ]; then
    echo "Error: OPENROUTER_API_KEY is required"
    exit 1
fi

read -p "POSTGRES_PASSWORD (press Enter to auto-generate): " POSTGRES_PASSWORD
if [ -z "$POSTGRES_PASSWORD" ]; then
    POSTGRES_PASSWORD=$(openssl rand -base64 16)
    echo "✓ Generated POSTGRES_PASSWORD: $POSTGRES_PASSWORD"
fi

POSTGRES_USER="scorex_user"
POSTGRES_DB="scorex_db"
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"

echo ""
echo "===== Deploying to K3s ====="
echo ""

# Create namespace
echo "1. Creating namespace..."
kubectl apply -f k8s/01-namespace.yaml

# Create secrets
echo "2. Creating secrets..."
kubectl create secret generic scorex-secrets \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
  --from-literal=NEXTAUTH_URL="$NEXTAUTH_URL" \
  --from-literal=OPENROUTER_API_KEY="$OPENROUTER_API_KEY" \
  --from-literal=AI_MODEL_GENERATION="openai/gpt-3.5-turbo" \
  --from-literal=NODE_ENV="production" \
  --from-literal=POSTGRES_USER="$POSTGRES_USER" \
  --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  --from-literal=POSTGRES_DB="$POSTGRES_DB" \
  --namespace=scorex \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✓ Secrets created"

# Deploy PostgreSQL
echo "3. Deploying PostgreSQL..."
kubectl apply -f k8s/03-postgres.yaml

echo "Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n scorex --timeout=300s

echo "✓ PostgreSQL is ready"

# Deploy ScoreX app
echo "4. Deploying ScoreX application..."
kubectl apply -f k8s/04-scorex-deployment.yaml

echo "Waiting for ScoreX pods to be ready..."
kubectl wait --for=condition=ready pod -l app=scorex -n scorex --timeout=300s

echo "✓ ScoreX application is ready"

# Deploy Ingress
echo "5. Deploying Ingress..."
kubectl apply -f k8s/05-ingress.yaml

echo ""
echo "===== Deployment Complete! ====="
echo ""
echo "Check deployment status:"
echo "  kubectl get all -n scorex"
echo ""
echo "View logs:"
echo "  kubectl logs -f deployment/scorex -n scorex"
echo ""
echo "Get ingress info:"
echo "  kubectl get ingress -n scorex"
echo ""
