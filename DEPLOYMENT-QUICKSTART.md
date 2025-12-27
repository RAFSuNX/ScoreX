# ScoreX K3s Deployment Quick Start

## Prerequisites
- K3s cluster running and accessible
- kubectl configured to access your K3s cluster
- GitHub Actions workflow completed (Docker image built and pushed to GHCR)

## Deployment Steps

### Option 1: Automated Script (Recommended)

```bash
./deploy-k3s.sh
```

The script will:
1. Check kubectl connectivity
2. Prompt for required secrets (generates NEXTAUTH_SECRET and POSTGRES_PASSWORD if not provided)
3. Deploy namespace, secrets, PostgreSQL, ScoreX app, and Ingress
4. Wait for all pods to be ready

### Option 2: Manual Deployment

#### 1. Check Workflow Status
```bash
gh run list --limit 1
```

Wait until status is `completed` and conclusion is `success`.

#### 2. Create Namespace
```bash
kubectl apply -f k8s/01-namespace.yaml
```

#### 3. Create Secrets
```bash
# Generate secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 16)

# Create Kubernetes secret
kubectl create secret generic scorex-secrets \
  --from-literal=DATABASE_URL="postgresql://scorex_user:${POSTGRES_PASSWORD}@postgres:5432/scorex_db" \
  --from-literal=NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
  --from-literal=NEXTAUTH_URL="http://localhost:3000" \
  --from-literal=OPENROUTER_API_KEY="your-api-key-here" \
  --from-literal=AI_MODEL_GENERATION="openai/gpt-3.5-turbo" \
  --from-literal=NODE_ENV="production" \
  --from-literal=POSTGRES_USER="scorex_user" \
  --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  --from-literal=POSTGRES_DB="scorex_db" \
  --namespace=scorex
```

#### 4. Deploy PostgreSQL
```bash
kubectl apply -f k8s/03-postgres.yaml

# Wait for PostgreSQL to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n scorex --timeout=300s
```

#### 5. Deploy ScoreX Application
```bash
kubectl apply -f k8s/04-scorex-deployment.yaml

# Wait for ScoreX to be ready
kubectl wait --for=condition=ready pod -l app=scorex -n scorex --timeout=300s
```

#### 6. Deploy IngressRoute
```bash
# Edit k8s/06-ingressroute.yaml to set your domain first
# Change 'scorex.rogx.cc' to your actual domain
kubectl apply -f k8s/06-ingressroute.yaml
```

## Verification

### Check All Resources
```bash
kubectl get all -n scorex
```

### Check Pods Status
```bash
kubectl get pods -n scorex
```

Expected output:
```
NAME                      READY   STATUS    RESTARTS   AGE
postgres-0                1/1     Running   0          2m
scorex-xxxxxxxxxx-xxxxx   1/1     Running   0          1m
scorex-xxxxxxxxxx-xxxxx   1/1     Running   0          1m
```

### Check Logs
```bash
# ScoreX application logs
kubectl logs -f deployment/scorex -n scorex

# PostgreSQL logs
kubectl logs -f statefulset/postgres -n scorex
```

### Check IngressRoute
```bash
kubectl get ingressroute -n scorex

# Get IngressRoute details
kubectl get ingressroute scorex -n scorex -o yaml
```

### Test Health Endpoint
```bash
# Get the service
kubectl get svc -n scorex

# Port forward for testing
kubectl port-forward svc/scorex 3000:80 -n scorex

# In another terminal
curl http://localhost:3000/api/health
```

## Troubleshooting

### Pods Not Starting
```bash
# Describe the pod
kubectl describe pod -l app=scorex -n scorex

# Check events
kubectl get events -n scorex --sort-by='.lastTimestamp'
```

### Image Pull Errors
If you see `ImagePullBackOff`:
```bash
# Check if image exists
docker pull ghcr.io/rafsunx/scorex:latest

# If private, create image pull secret
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=RAFSuNX \
  --docker-password=YOUR_GITHUB_PAT \
  --namespace=scorex

# Update deployment to use the secret (add to spec.template.spec):
kubectl edit deployment scorex -n scorex
# Add:
#   imagePullSecrets:
#   - name: ghcr-secret
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
kubectl get pods -n scorex -l app=postgres

# Test database connection from ScoreX pod
kubectl exec -it deployment/scorex -n scorex -- \
  sh -c 'echo "SELECT 1" | psql $DATABASE_URL'
```

### View Migration Logs
```bash
# Check if migrations ran successfully
kubectl logs deployment/scorex -n scorex | grep -i migration
```

## Scaling

Scale the application:
```bash
kubectl scale deployment scorex --replicas=3 -n scorex
```

## Cleanup

Remove everything:
```bash
kubectl delete namespace scorex
```

## Next Steps

1. Configure your domain in Traefik
2. Set up SSL/TLS certificates
3. Configure monitoring and alerting
4. Set up automated backups for PostgreSQL

## Useful Commands

```bash
# Watch pod status
watch kubectl get pods -n scorex

# Stream all logs
kubectl logs -f deployment/scorex -n scorex --all-containers=true

# Get resource usage
kubectl top pods -n scorex

# Restart deployment
kubectl rollout restart deployment/scorex -n scorex

# Check rollout status
kubectl rollout status deployment/scorex -n scorex
```
