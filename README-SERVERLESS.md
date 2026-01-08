# Serverless Architecture Branch

This branch contains the **AWS Serverless** implementation using:
- **AWS Lambda** for compute
- **API Gateway** for REST API
- **S3** for static website hosting
- **Server-Sent Events (SSE)** for real-time updates

## Cost: $1-5/month (vs $32-37/month for Elastic Beanstalk)

## Quick Start

```powershell
# Install dependencies
npm install

# Build project
npm run build

# Deploy with SAM
sam build
sam deploy --guided

# Upload frontend to S3
aws s3 sync public/ s3://your-bucket-name/
```

See [AWS_SERVERLESS_DEPLOYMENT.md](./AWS_SERVERLESS_DEPLOYMENT.md) for complete instructions.

## Key Changes from Master Branch

1. **Removed Socket.IO** → Replaced with Server-Sent Events (SSE)
2. **Added Lambda handler** → `src/lambda/workflow.ts`
3. **New frontend** → `public/index-serverless.html` with SSE support
4. **SAM template** → `template.yaml` for infrastructure as code
5. **Cost optimized** → Pay only for what you use

## Architecture

```
┌─────────────┐
│   S3 Bucket │  ← Static Website (HTML/CSS/JS)
└──────┬──────┘
       │
       ↓ API calls
┌─────────────┐
│ API Gateway │  ← REST API with SSE support
└──────┬──────┘
       │
       ↓ Invokes
┌─────────────┐
│   Lambda    │  ← Content generation workflow
└─────────────┘
```

## Deployment Options

### Option 1: AWS SAM (Recommended)
- Infrastructure as Code
- Easy updates and rollbacks
- Automatic resource creation

### Option 2: Manual Lambda + S3
- More control
- Step-by-step setup
- Good for learning

## Benefits

✅ **90% cost reduction** ($32 → $3/month)
✅ **Auto-scaling** to zero when idle
✅ **High availability** built-in
✅ **No server management** required
✅ **Fast deployments** (30-60 seconds)

## Limitations

⚠️ **Cold starts** (~1-2 seconds first request)
⚠️ **SSE instead of WebSocket** (polling-based real-time)
⚠️ **Lambda timeout** (max 15 minutes)

## Merge Strategy

This branch is experimental. Once tested and stable:

```powershell
# Merge into master
git checkout master
git merge develop
git push origin master
```

Or keep both deployments available:
- `master` → Elastic Beanstalk (traditional)
- `develop` → Lambda Serverless (cost-optimized)
