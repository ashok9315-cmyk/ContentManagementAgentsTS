# GitHub Actions CI/CD Setup

This repository uses GitHub Actions to automatically deploy the application to AWS when changes are pushed to the `master` branch.

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

The deployment workflow runs automatically on:

- **Push to master**: Any commit pushed to the master branch
- **Manual trigger**: Via GitHub Actions UI (workflow_dispatch)

## Workflow Steps

1. **Checkout code** - Gets the latest code from the repository
2. **Setup Node.js** - Installs Node.js 20.x
3. **Install dependencies** - Runs `npm ci` for clean install
4. **Build TypeScript** - Compiles TypeScript to JavaScript
5. **Build Lambda package** - Bundles Lambda code with dependencies
6. **Configure AWS** - Sets up AWS credentials
7. **Deploy with CDK** - Deploys infrastructure and code
8. **Invalidate CloudFront** - Clears CDN cache for fresh content
9. **Deployment summary** - Shows deployment details

## Manual Deployment

To trigger a deployment manually:

1. Go to: `Actions` tab in GitHub
2. Select `Deploy to AWS` workflow
3. Click `Run workflow`
4. Select `master` branch
5. Click `Run workflow` button

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
