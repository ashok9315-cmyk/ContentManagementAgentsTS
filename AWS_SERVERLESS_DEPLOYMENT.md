# 🚀 AWS Serverless Deployment Guide
## Lambda + API Gateway + S3 (Cost: $1-5/month)

This guide shows how to deploy the AI Content Studio as a **100% serverless application** using AWS Lambda, API Gateway, and S3.

---

## 💰 Cost Comparison

| Component | EBS (Current) | Serverless | Savings |
|-----------|---------------|------------|---------|
| **Compute** | $15/month | $0-2/month | **~$13** |
| **Load Balancer** | $16/month | Included in API Gateway | **~$16** |
| **Static Hosting** | Included | $0.50/month (S3) | **~$0** |
| **API Gateway** | - | $1-3/month | **-$1-3** |
| **Total** | **$32-37/month** | **$1-5/month** | **$27-32** 💰 |

### AWS Free Tier Benefits (First 12 Months + Perpetual)
- **Lambda**: 1M requests/month FREE (perpetual)
- **API Gateway**: 1M requests/month FREE (first 12 months)
- **S3**: 5GB storage FREE (first 12 months)
- **CloudWatch**: 5GB logs FREE

---

## 📋 Prerequisites

1. **AWS Account**: [aws.amazon.com](https://aws.amazon.com)
2. **AWS CLI**: [Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
3. **AWS SAM CLI**: [Installation Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
4. **Node.js 20+**: [nodejs.org](https://nodejs.org/)
5. **OpenAI API Key**: [platform.openai.com](https://platform.openai.com/api-keys)

---

## 🪟 Windows Setup

### Step 1: Install AWS CLI

**Option A: MSI Installer (Recommended)**
```powershell
# Download and install
# Visit: https://awscli.amazonaws.com/AWSCLIV2.msi
# Run the installer

# Verify
aws --version
```

**Option B: Using winget**
```powershell
winget install Amazon.AWSCLI

# Verify
aws --version
```

### Step 2: Install AWS SAM CLI

```powershell
# Using MSI Installer (Recommended)
# Download from: https://github.com/aws/aws-sam-cli/releases/latest/download/AWS_SAM_CLI_64_PY3.msi
# Run the installer

# Verify installation
sam --version

# Expected output: SAM CLI, version 1.x.x
```

**Alternative: Using pip**
```powershell
pip install aws-sam-cli
sam --version
```

### Step 3: Configure AWS Credentials

```powershell
# Configure your AWS credentials
aws configure

# You'll be prompted for:
# - AWS Access Key ID: (from AWS IAM Console)
# - AWS Secret Access Key: (from AWS IAM Console)
# - Default region: us-east-1
# - Default output format: json
```

---

## 🚀 Deployment Steps

### Step 1: Install Dependencies

```powershell
# Navigate to your project
cd "c:\VS Code Workspace\ContentManagementAgentsTS"

# Install Node.js dependencies
npm install
```

### Step 2: Build the Project

```powershell
# Compile TypeScript to JavaScript
npm run build

# Verify dist folder was created
ls dist
```

### Step 3: Deploy with SAM

```powershell
# Build SAM application
sam build

# Deploy (first time - interactive)
sam deploy --guided

# You'll be prompted for:
# Stack Name: ai-content-studio-serverless
# AWS Region: us-east-1 (or your preferred region)
# Parameter OpenAIAPIKey: sk-your-openai-key-here
# Parameter Environment: prod
# Confirm changes before deploy: Y
# Allow SAM CLI IAM role creation: Y
# Disable rollback: N
# Save arguments to configuration file: Y
# SAM configuration file: samconfig.toml
# SAM configuration environment: default
```

### Step 4: Get Your Endpoints

After deployment completes, SAM will display:

```
Outputs:
  ApiEndpoint: https://abc123.execute-api.us-east-1.amazonaws.com/prod
  WebsiteURL: http://ai-content-studio-prod-123456789.s3-website-us-east-1.amazonaws.com
```

### Step 5: Upload Frontend to S3

```powershell
# Get your bucket name from SAM output
$BUCKET_NAME = "ai-content-studio-prod-123456789"

# Upload static files
aws s3 cp public/index-serverless.html s3://$BUCKET_NAME/index-serverless.html --content-type "text/html"
aws s3 cp public/styles.css s3://$BUCKET_NAME/styles.css --content-type "text/css"

# If you have other assets
aws s3 sync public/ s3://$BUCKET_NAME/ --exclude "index.html" --exclude "*.js"

# Make files public
aws s3api put-object-acl --bucket $BUCKET_NAME --key index-serverless.html --acl public-read
aws s3api put-object-acl --bucket $BUCKET_NAME --key styles.css --acl public-read
```

### Step 6: Update Frontend API Endpoint

Edit `public/index-serverless.html` and update the API endpoint:

```javascript
const API_ENDPOINT = 'https://abc123.execute-api.us-east-1.amazonaws.com/prod';
```

Then re-upload:

```powershell
aws s3 cp public/index-serverless.html s3://$BUCKET_NAME/index-serverless.html --content-type "text/html"
```

### Step 7: Test Your Application

```powershell
# Open in browser
start http://ai-content-studio-prod-123456789.s3-website-us-east-1.amazonaws.com/index-serverless.html

# Or use the PowerShell alias
Invoke-WebRequest http://your-website-url.s3-website-us-east-1.amazonaws.com/index-serverless.html
```

---

## 📊 Subsequent Deployments

After initial setup, deploy updates with:

```powershell
# Build and deploy
npm run build
sam build
sam deploy

# Upload updated frontend
aws s3 sync public/ s3://$BUCKET_NAME/
```

---

## 🔍 Monitoring & Logs

### View Lambda Logs

```powershell
# View recent logs
sam logs -n WorkflowFunction --stack-name ai-content-studio-serverless

# Tail logs in real-time
sam logs -n WorkflowFunction --stack-name ai-content-studio-serverless --tail
```

### CloudWatch Logs (Web Console)

1. Go to [AWS CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. Click **Logs** → **Log groups**
3. Find `/aws/lambda/ai-content-studio-prod`
4. Click to view logs

### API Gateway Metrics

```powershell
# View API Gateway metrics
aws cloudwatch get-metric-statistics `
  --namespace AWS/ApiGateway `
  --metric-name Count `
  --dimensions Name=ApiName,Value=ai-content-studio-api-prod `
  --start-time 2026-01-07T00:00:00Z `
  --end-time 2026-01-08T23:59:59Z `
  --period 3600 `
  --statistics Sum
```

---

## 🎛️ Configuration Management

### Update Environment Variables

```powershell
# Update OpenAI API Key
aws lambda update-function-configuration `
  --function-name ai-content-studio-prod `
  --environment "Variables={OPENAI_API_KEY=sk-new-key-here,NODE_ENV=production}"

# Verify
aws lambda get-function-configuration --function-name ai-content-studio-prod --query 'Environment'
```

### Update Lambda Memory/Timeout

```powershell
# Increase memory (increases cost but improves performance)
aws lambda update-function-configuration `
  --function-name ai-content-studio-prod `
  --memory-size 2048 `
  --timeout 600
```

---

## 💰 Cost Monitoring

### Set Up Billing Alerts

```powershell
# Create billing alarm (via AWS Console)
# 1. Go to CloudWatch → Alarms → Create Alarm
# 2. Select Metric → Billing → Total Estimated Charge
# 3. Set threshold: $10
# 4. Create SNS topic for notifications
# 5. Enter your email
```

### View Current Costs

```powershell
# Install AWS Cost Explorer CLI
pip install boto3

# View costs (requires boto3 script)
# Or use AWS Console: https://console.aws.amazon.com/cost-management/home
```

---

## 🔧 Troubleshooting

### Lambda Function Fails

```powershell
# Check logs
sam logs -n WorkflowFunction --stack-name ai-content-studio-serverless --tail

# Common issues:
# - OPENAI_API_KEY not set
# - Timeout (increase to 600s)
# - Memory limit (increase to 2048MB)
```

### API Gateway CORS Errors

```javascript
// Frontend sees "CORS policy" error
// Fix: Update template.yaml CORS settings

Cors:
  AllowMethods: "'GET,POST,OPTIONS'"
  AllowHeaders: "'Content-Type,Authorization'"
  AllowOrigin: "'*'"  # Or specific domain
```

### S3 Website Not Loading

```powershell
# Check bucket policy
aws s3api get-bucket-policy --bucket $BUCKET_NAME

# Make objects public
aws s3api put-bucket-acl --bucket $BUCKET_NAME --acl public-read
aws s3api put-object-acl --bucket $BUCKET_NAME --key index-serverless.html --acl public-read
```

### SAM Build Fails

```powershell
# Clear cache and rebuild
Remove-Item -Recurse -Force .aws-sam
sam build --use-container

# If still fails, check:
# - Node.js version (must be 20+)
# - TypeScript compilation errors
# - Missing dependencies
```

---

## 🌐 Custom Domain (Optional)

### Using Route 53 + CloudFront

1. **Register domain** in Route 53 (or use existing)
2. **Create CloudFront distribution** for S3 bucket
3. **Request SSL certificate** in ACM (Certificate Manager)
4. **Update CloudFront** with custom domain
5. **Create Route 53 alias** record

```powershell
# Example: Create CloudFront distribution
aws cloudfront create-distribution `
  --origin-domain-name $BUCKET_NAME.s3.amazonaws.com `
  --default-root-object index-serverless.html
```

---

## 🧹 Cleanup / Delete Stack

```powershell
# Delete entire stack (removes all resources)
sam delete --stack-name ai-content-studio-serverless

# Or via AWS CLI
aws cloudformation delete-stack --stack-name ai-content-studio-serverless

# Empty and delete S3 bucket manually (if needed)
aws s3 rm s3://$BUCKET_NAME --recursive
aws s3 rb s3://$BUCKET_NAME
```

---

## 📈 Scaling & Performance

### Auto-Scaling (Built-in)
- Lambda automatically scales to handle requests
- No configuration needed
- Concurrent executions: 1000 (default limit)

### Increase Concurrent Executions

```powershell
# Request limit increase via AWS Support
# Or set reserved concurrency
aws lambda put-function-concurrency `
  --function-name ai-content-studio-prod `
  --reserved-concurrent-executions 100
```

### Performance Optimization

1. **Increase Lambda Memory**: More memory = faster CPU
   ```powershell
   aws lambda update-function-configuration `
     --function-name ai-content-studio-prod `
     --memory-size 2048
   ```

2. **Enable Lambda SnapStart** (for faster cold starts)
3. **Use CloudFront** for static assets (faster global delivery)

---

## 🆚 Architecture Comparison

### Elastic Beanstalk (Current)
```
Cost: $32-37/month
✅ Simple deployment
✅ WebSocket support (Socket.IO)
❌ Always running (even when idle)
❌ Fixed monthly cost
```

### Serverless (New)
```
Cost: $1-5/month
✅ Pay only for usage
✅ Auto-scales to zero
✅ No server management
✅ Built-in high availability
⚠️ Server-Sent Events (instead of WebSocket)
⚠️ Cold start latency (~1-2s)
```

---

## 📚 Additional Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [API Gateway SSE Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-payload-encodings.html)
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

---

## ✅ Benefits Summary

**Cost Savings:**
- 85-90% reduction in AWS costs
- $27-32/month savings vs Elastic Beanstalk
- Free tier covers most development usage

**Operational:**
- Zero server management
- Automatic scaling
- High availability built-in
- No patching or maintenance

**Development:**
- Faster deployments (30-60s)
- Easy rollback with versioning
- Separate dev/prod environments
- Infrastructure as Code (SAM)

---

**Ready to deploy!** 🚀

Start with: `sam build && sam deploy --guided`
