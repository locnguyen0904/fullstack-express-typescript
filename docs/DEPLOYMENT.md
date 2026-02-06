# Deployment Guide — Google Cloud Run

This guide covers setting up Google Cloud infrastructure and configuring the CD pipeline for automated deployments.

## Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud` CLI)
- A Google Cloud project with billing enabled
- GitHub repository with admin access (for secrets)

## Step 0. Install & Login

```bash
# Login to Google Cloud
gcloud auth login

# Set your project and region
export PROJECT_ID=your-project-id
export REGION=asia-southeast1

gcloud config set project $PROJECT_ID
```

## Step 1. Enable GCP APIs

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  vpcaccess.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com
```

## Step 2. Create Artifact Registry Repository

```bash
gcloud artifacts repositories create backend-template \
  --repository-format=docker \
  --location=$REGION \
  --description="Docker images for backend-template"
```

## Step 3. Set Up Workload Identity Federation

This allows GitHub Actions to authenticate to GCP without service account keys.

### 3.1 Create Workload Identity Pool

```bash
gcloud iam workload-identity-pools create "github-pool" \
  --project=$PROJECT_ID \
  --location="global" \
  --display-name="GitHub Actions Pool"
```

### 3.2 Create Workload Identity Provider

```bash
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project=$PROJECT_ID \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

### 3.3 Create Service Account

```bash
gcloud iam service-accounts create cd-deployer \
  --display-name="CD Pipeline Deployer"
```

## Step 4. Grant IAM Roles

```bash
SA_EMAIL=cd-deployer@${PROJECT_ID}.iam.gserviceaccount.com

# Cloud Run admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/run.admin"

# Artifact Registry writer
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/artifactregistry.writer"

# Service Account user (to act as Cloud Run runtime SA)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/iam.serviceAccountUser"

# Secret Manager accessor
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```

## Step 5. Allow GitHub to Impersonate Service Account

Replace `YOUR_GITHUB_ORG/YOUR_REPO` with your repository (e.g., `locnguyen0904/backend-template`):

```bash
REPO=locnguyen0904/backend-template

gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')/locations/global/workloadIdentityPools/github-pool/attribute.repository/$REPO"
```

## Step 6. Create Secrets in Secret Manager

Your app reads environment variables like `DATABASE_URL`, `JWT_SECRET`, etc. In Cloud Run, these are mapped from Secret Manager (kebab-case) to env vars (UPPER_SNAKE_CASE) automatically by the CD workflow.

| Env Var (app reads)  | Secret Manager name | Description                |
| -------------------- | ------------------- | -------------------------- |
| `DATABASE_URL`       | `database-url`      | MongoDB connection string  |
| `JWT_SECRET`         | `jwt-secret`        | JWT signing key (min 32ch) |
| `ENCRYPTION_KEY`     | `encryption-key`    | AES-256 key (min 32ch)     |
| `REDIS_URL`          | `redis-url`         | Redis connection string    |
| `ADMIN_PASSWORD`     | `admin-password`    | Admin seed password        |

```bash
# Database (get connection string from MongoDB Atlas — see Step 8)
echo -n "mongodb+srv://user:pass@cluster.mongodb.net/backend-template" | \
  gcloud secrets create database-url --data-file=-

# JWT Secret (generate random 32+ char string)
echo -n "$(openssl rand -base64 48)" | \
  gcloud secrets create jwt-secret --data-file=-

# Encryption Key (generate random 32+ char string)
echo -n "$(openssl rand -base64 48)" | \
  gcloud secrets create encryption-key --data-file=-

# Redis URL (update with actual IP after Step 7)
echo -n "redis://10.0.0.3:6379" | \
  gcloud secrets create redis-url --data-file=-

# Admin Password
echo -n "your-secure-admin-password" | \
  gcloud secrets create admin-password --data-file=-
```

### Verify secrets

```bash
gcloud secrets list
```

### Update a secret value

```bash
echo -n "new-value" | \
  gcloud secrets versions add database-url --data-file=-
```

## Step 7. Set Up Memorystore (Redis)

```bash
# Create a VPC connector for Cloud Run → Memorystore
gcloud compute networks vpc-access connectors create cloud-run-connector \
  --region=$REGION \
  --range="10.8.0.0/28"

# Create Redis instance
gcloud redis instances create backend-template-redis \
  --size=1 \
  --region=$REGION \
  --redis-version=redis_6_x \
  --tier=basic
```

After creation, get the Redis IP and update the secret:

```bash
# Get Redis IP
gcloud redis instances describe backend-template-redis \
  --region=$REGION --format="value(host)"

# Update redis-url secret with actual IP
echo -n "redis://<REDIS_IP>:6379" | \
  gcloud secrets versions add redis-url --data-file=-
```

## Step 8. Set Up MongoDB Atlas

1. Create a free/shared cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Choose **Google Cloud** as the cloud provider, same region as Cloud Run (`asia-southeast1`)
3. Create a database user with read/write access
4. **Network Access:** Add `0.0.0.0/0` (or use VPC peering for production)
5. Get the connection string and update the secret:

```bash
echo -n "mongodb+srv://user:pass@cluster.mongodb.net/backend-template" | \
  gcloud secrets versions add database-url --data-file=-
```

## Step 9. Configure GitHub Secrets

Get the 4 values needed:

```bash
# 1. Project ID
gcloud config get-value project

# 2. Region
echo $REGION

# 3. Service Account email
echo "cd-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

# 4. Workload Identity Provider (full path)
gcloud iam workload-identity-pools providers describe github-provider \
  --project=$PROJECT_ID \
  --location=global \
  --workload-identity-pool=github-pool \
  --format="value(name)"
# → projects/123456789/locations/global/workloadIdentityPools/github-pool/providers/github-provider
```

Go to your repository **Settings > Secrets and variables > Actions** and add:

| Secret Name                      | Value                                               |
| -------------------------------- | --------------------------------------------------- |
| `GCP_PROJECT_ID`                 | Output from command 1                               |
| `GCP_REGION`                     | `asia-southeast1`                                   |
| `GCP_SERVICE_ACCOUNT`            | Output from command 3                               |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Output from command 4 (full path)                   |

## Step 10. Deploy

After all the above is configured:

```bash
# First deploy: push to develop for staging
git push origin develop

# After verifying staging, merge to main for production
git checkout main
git merge develop
git push origin main
```

The CD workflow triggers automatically after CI passes.

### Manual Deploy (if needed)

```bash
# Backend
gcloud run deploy backend-api-prod \
  --image=$REGION-docker.pkg.dev/$PROJECT_ID/backend-template/backend-api:latest \
  --region=$REGION \
  --platform=managed

# Frontend
gcloud run deploy frontend-app-prod \
  --image=$REGION-docker.pkg.dev/$PROJECT_ID/backend-template/frontend-app:latest \
  --region=$REGION \
  --platform=managed
```

## Step 11. After First Deploy — Attach VPC Connector

Cloud Run needs the VPC connector to reach Memorystore (Redis):

```bash
gcloud run services update backend-api-prod \
  --region=$REGION \
  --vpc-connector=cloud-run-connector

gcloud run services update backend-api-staging \
  --region=$REGION \
  --vpc-connector=cloud-run-connector
```

## Step 12. Custom Domain (Optional)

```bash
# Map custom domain to backend
gcloud run domain-mappings create \
  --service=backend-api-prod \
  --domain=api.yourdomain.com \
  --region=$REGION

# Map custom domain to frontend
gcloud run domain-mappings create \
  --service=frontend-app-prod \
  --domain=app.yourdomain.com \
  --region=$REGION
```

Then add the DNS records shown by the command to your domain provider.

## Step 13. Monitoring

### View logs

```bash
# Backend logs
gcloud run services logs read backend-api-prod --region=$REGION --limit=50

# Frontend logs
gcloud run services logs read frontend-app-prod --region=$REGION --limit=50
```

### View metrics

Open [Cloud Run Console](https://console.cloud.google.com/run) to see:

- Request count
- Latency (p50, p95, p99)
- Container instance count
- Memory/CPU utilization
- Error rate

## Setup Checklist

Use this checklist to track your progress:

- [ ] Step 0: `gcloud` installed and logged in
- [ ] Step 1: GCP APIs enabled
- [ ] Step 2: Artifact Registry repository created
- [ ] Step 3: Workload Identity (pool + provider + service account)
- [ ] Step 4: IAM roles granted to service account
- [ ] Step 5: GitHub impersonation allowed
- [ ] Step 6: Secrets created in Secret Manager
- [ ] Step 7: Memorystore Redis + VPC connector created
- [ ] Step 8: MongoDB Atlas configured, connection string in Secret Manager
- [ ] Step 9: 4 GitHub secrets added
- [ ] Step 10: Code merged and pushed — CD pipeline runs
- [ ] Step 11: VPC connector attached to Cloud Run services
- [ ] Step 12: Custom domain mapped (optional)

## Troubleshooting

### Deployment fails with permission error

```bash
# Verify service account roles
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:cd-deployer@" \
  --format="table(bindings.role)"
```

### Cloud Run can't connect to Memorystore

- Ensure VPC connector is attached to the Cloud Run service (Step 11)
- Check that Redis instance and VPC connector are in the same region

### Container crashes on startup

```bash
# Check logs
gcloud run services logs read backend-api-prod --region=$REGION --limit=100

# Common causes:
# - Missing secrets (check Secret Manager)
# - Wrong DATABASE_URL format
# - Redis not reachable (VPC connector missing)
```

### Frontend shows wrong API URL

- `VITE_API_URL` is baked at build time
- Redeploy frontend after backend URL changes
- Check the build args in the CD workflow
