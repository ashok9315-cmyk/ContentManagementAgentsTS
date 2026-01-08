# GitHub Actions Multi-Stage CI/CD Pipeline

This repository uses a sophisticated multi-stage CI/CD pipeline that automatically builds, tests, and deploys to staging and production environments.

## Pipeline Stages

### 1. Build & Test
- Runs on every push and pull request
- Installs dependencies and builds TypeScript
- Runs linting and tests (if configured)
- Creates Lambda deployment package
- Uploads build artifacts for deployment stages

### 2. Deploy to Staging
- **Triggers:** Push to `develop` branch
- **Environment:** Staging
- **URL:** https://staging-ai-content-studio.solutionsynth.cloud (if configured)
- Uses build artifacts from Stage 1
- Deploys to AWS staging stack

### 3. Deploy to Production
- **Triggers:** Push to `master` branch
- **Environment:** Production  
- **URL:** https://ai-content-studio.solutionsynth.cloud
- Requires manual approval via GitHub Environment protection (optional)
- Uses build artifacts from Stage 1
- Deploys to AWS production stack

### 4. Health Check
- Runs after successful deployments
- Verifies API endpoints are responding
- Provides deployment status summary

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

### AWS Credentials
1. Go to: `Settings` → `Secrets and variables` → `Actions`
2. Click `New repository secret` and add:

**AWS_ACCESS_KEY_ID**
- Your AWS access key ID
- Get from AWS IAM console

**AWS_SECRET_ACCESS_KEY**
- Your AWS secret access key
- Get from AWS IAM console

**OPENAI_API_KEY**
- Your OpenAI API key
- Format: `sk-proj-...`

## Setting Up AWS Credentials

### Option 1: Create IAM User (Recommended)

1. Go to AWS IAM Console
2. Create a new IAM user: `github-actions-deployer`
3. Attach policies:
   - `AWSCloudFormationFullAccess`
   - `AWSLambda_FullAccess`
   - `IAMFullAccess`
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
   - `AmazonAPIGatewayAdministrator`
   - `AWSCertificateManagerFullAccess`
   - `AmazonRoute53FullAccess`

4. Create access key and save credentials

### Option 2: Use Existing Credentials

If you already have AWS credentials configured locally:

```bash
# View your access key
aws configure get aws_access_key_id

# Get your secret key from AWS CLI config
cat ~/.aws/credentials
```

## Adding Secrets to GitHub

1. Navigate to: `https://github.com/YOUR_USERNAME/ContentManagementAgentsTS/settings/secrets/actions`
2. Click "New repository secret"
3. Add each secret:
   - Name: `AWS_ACCESS_KEY_ID`
   - Value: `your-access-key-id`
   
   - Name: `AWS_SECRET_ACCESS_KEY`
   - Value: `your-secret-access-key`
   
   - Name: `OPENAI_API_KEY`
   - Value: `sk-proj-your-openai-key`

## Workflow Triggers

The multi-stage pipeline runs automatically based on:

- **Push to `develop` branch**: Build → Deploy to Staging → Health Check
- **Push to `master` branch**: Build → Deploy to Production → Health Check
- **Pull Request to `master`**: Build & Test only (no deployment)
- **Manual trigger**: Via GitHub Actions UI (choose staging or production)

## Branch Strategy

- **`develop`** → Staging environment (for testing)
- **`master`** → Production environment (live)
- **Feature branches** → Build & test only

## GitHub Environment Configuration (Optional)

For additional security, configure environment protection rules:

1. Go to: `Settings` → `Environments`
2. Create two environments:
   - **staging** (auto-deploy)
   - **production** (requires approval)

3. For **production** environment, add:
   - **Required reviewers**: Select team members who must approve
   - **Wait timer**: Optional delay before deployment
   - **Environment secrets**: Production-specific secrets

This adds a manual approval step before production deployments.

## Workflow Steps

### Stage 1: Build & Test
1. **Checkout code** - Gets the latest code
2. **Setup Node.js** - Installs Node.js 20.x
3. **Install dependencies** - Runs `npm install`
4. **Lint code** - Checks code quality (if configured)
5. **Build TypeScript** - Compiles to JavaScript
6. **Run tests** - Executes test suite (if configured)
7. **Build Lambda package** - Creates deployment package
8. **Upload artifacts** - Saves build for deployment stages

### Stage 2: Deploy to Staging (develop branch)
1. **Download artifacts** - Gets build from Stage 1
2. **Configure AWS** - Sets up credentials
3. **Deploy with CDK** - Deploys to staging stack
4. **Invalidate CloudFront** - Clears staging CDN cache

### Stage 3: Deploy to Production (master branch)
1. **Download artifacts** - Gets build from Stage 1
2. **Configure AWS** - Sets up credentials
3. **Deploy with CDK** - Deploys to production stack
4. **Invalidate CloudFront** - Clears production CDN cache
5. **Deployment summary** - Shows deployment details

### Stage 4: Health Check
1. **Check Production** - Verifies API is responding
2. **Check Staging** - Verifies staging deployment
3. **Generate report** - Creates health status summary

## Manual Deployment

To trigger a deployment manually:

1. Go to: `Actions` tab in GitHub
2. Select `Multi-Stage CI/CD Pipeline` workflow
3. Click `Run workflow`
4. Select branch (`master` or `develop`)
5. Choose environment (`staging` or `production`)
6. Click `Run workflow` button

## Deployment Workflow Examples

### Deploying a New Feature

```bash
# Create feature branch
git checkout -b feature/new-feature develop

# Make changes and commit
git add .
git commit -m "feat: Add new feature"
git push origin feature/new-feature

# Create PR to develop → Triggers Build & Test
# Merge to develop → Deploys to Staging

# After testing in staging, create PR to master
# Merge to master → Deploys to Production
```

### Hotfix to Production

```bash
# Create hotfix branch from master
git checkout -b hotfix/critical-fix master

# Fix and commit
git add .
git commit -m "fix: Critical bug fix"

# Merge directly to master → Deploys to Production
git checkout master
git merge hotfix/critical-fix
git push origin master
```

## Viewing Deployment Status

- Go to the `Actions` tab in your repository
- Click on the latest workflow run
- View logs for each step
- Check deployment summary at the bottom

## Deployment Outputs

After successful deployment, you'll see:

- ✅ Website URL: https://ai-content-studio.solutionsynth.cloud
- ✅ API Endpoint URL
- ✅ CloudFront Distribution ID
- ✅ S3 Bucket Name
- ✅ Lambda Function ARN

## Troubleshooting

### Deployment fails with "AccessDenied"

- Check that AWS credentials are correct
- Verify IAM user has required permissions
- Ensure secrets are properly configured

### CDK deployment fails

- Check CloudWatch logs for Lambda errors
- Verify OpenAI API key is valid
- Check AWS region is correct (us-east-1)

### CloudFront invalidation fails

- Check IAM user has CloudFront permissions
- Verify distribution ID is correct

## Local Development vs CI/CD

**Local Development:**
```bash
# Build and deploy locally
.\build-lambda-cdk.ps1
$env:OPENAI_API_KEY = "your-key"
cdk deploy --require-approval never
```

**CI/CD (Automatic):**
- Push to master → GitHub Actions deploys automatically
- No manual intervention needed
- Secrets managed securely by GitHub

## Monitoring Deployments

Check deployment status:
- GitHub Actions UI: Real-time logs
- AWS CloudFormation: Stack status
- AWS Lambda: Function logs in CloudWatch
- CloudFront: Cache invalidation status

## Security Best Practices

1. ✅ Never commit AWS credentials or API keys
2. ✅ Use GitHub Secrets for sensitive data
3. ✅ Rotate credentials regularly
4. ✅ Use least-privilege IAM policies
5. ✅ Enable 2FA on AWS and GitHub accounts
6. ✅ Review deployment logs for anomalies

## Cost Monitoring

Monitor AWS costs:
- Lambda invocations: ~$0.20 per 1M requests
- S3 storage: ~$0.023 per GB
- CloudFront: ~$0.085 per GB transfer
- API Gateway: ~$3.50 per 1M requests

Expected monthly cost: **$0-5** for typical usage
