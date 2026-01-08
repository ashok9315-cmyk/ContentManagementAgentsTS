# Serverless Architecture

This implementation uses **AWS CDK** to deploy serverless infrastructure:
- **AWS Lambda** for compute (15-minute timeout, 2GB memory)
- **API Gateway** for REST API with CORS
- **S3** for static website storage
- **CloudFront** for HTTPS content delivery
- **Simple JSON responses** (SSE removed for API Gateway compatibility)

## Cost: $3-5/month (vs $32-37/month for Elastic Beanstalk)

## Quick Start

```powershell
# Install dependencies
npm install

# Set OpenAI API Key
$env:OPENAI_API_KEY = "sk-your-key-here"

# Bootstrap CDK (first time only)
cdk bootstrap aws://ACCOUNT-ID/us-east-1

# Build and deploy
npm run build
npm run cdk:deploy

# Get your URLs
aws cloudformation describe-stacks --stack-name ContentStudioStack --query 'Stacks[0].Outputs'
```

See [CDK_DEPLOYMENT_GUIDE.md](./CDK_DEPLOYMENT_GUIDE.md) for complete instructions.

## Key Features

1. **Removed Socket.IO & SSE** → Simple JSON REST API
2. **Lambda handler** → `src/lambda/workflow.ts`
3. **Serverless frontend** → `public/index-serverless.html`
4. **CDK Infrastructure** → `cdk/content-studio-stack.ts`
5. **CORS fixed** → Full CORS support with all headers
6. **Timeout fixed** → 15-minute Lambda timeout
7. **Cost optimized** → Pay only for what you use

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
