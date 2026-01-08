# 🚀 AWS CDK Deployment Guide
## Infrastructure as Code with TypeScript

This guide shows how to deploy the AI Content Studio using **AWS CDK** (Cloud Development Kit) with TypeScript.

---

## 💰 Cost: $1-5/month

Same serverless architecture as SAM, but with TypeScript instead of YAML!

---

## 📋 Prerequisites

1. **AWS Account**: [aws.amazon.com](https://aws.amazon.com)
2. **AWS CLI**: Configured with credentials (`aws configure`)
3. **Node.js 20+**: [nodejs.org](https://nodejs.org/)
4. **AWS CDK CLI**: Installed globally

---

## 🪟 Installation

### Install AWS CDK CLI

```powershell
# Install CDK globally
npm install -g aws-cdk

# Verify installation
cdk --version
```

### Install Project Dependencies

```powershell
# Navigate to project
cd "c:\VS Code Workspace\ContentManagementAgentsTS"

# Install dependencies (includes CDK libraries)
npm install
```

---

## 🚀 Deployment Steps

### Step 1: Build Your Lambda Code

```powershell
# Build TypeScript
npm run build

# Verify dist folder exists
ls dist
```

### Step 2: Bootstrap CDK (First Time Only)

```powershell
# Bootstrap CDK in your AWS account (one-time setup)
cdk bootstrap

# This creates an S3 bucket and IAM roles for CDK
```

### Step 3: Review Infrastructure

```powershell
# Synthesize CloudFormation template
npm run cdk:synth

# View what will be deployed
npm run cdk:diff
```

### Step 4: Deploy to AWS

```powershell
# Deploy with your OpenAI API key
npm run cdk:deploy -- --context openAIApiKey=YOUR_OPENAI_API_KEY_HERE

# Or set as environment variable
$env:OPENAI_API_KEY="YOUR_OPENAI_API_KEY_HERE"
npm run cdk:deploy
```

**Deployment will:**
- Create Lambda function
- Create API Gateway
- Create S3 bucket
- Upload static files
- Configure CORS
- Set up CloudWatch logs

### Step 5: Get Your Endpoints

After deployment, CDK will output:

```
Outputs:
ContentStudioStack.ApiEndpoint = https://abc123.execute-api.us-east-1.amazonaws.com/prod/
ContentStudioStack.WebsiteURL = http://ai-content-studio-prod-123456789.s3-website-us-east-1.amazonaws.com
ContentStudioStack.LambdaFunctionArn = arn:aws:lambda:us-east-1:123456789:function:ai-content-studio-prod
```

### Step 6: Update Frontend

Edit `public/index-serverless.html` and update the API endpoint:

```javascript
const API_ENDPOINT = 'https://abc123.execute-api.us-east-1.amazonaws.com/prod';
```

Then redeploy:

```powershell
npm run cdk:deploy
```

---

## 🔄 Subsequent Deployments

```powershell
# Make your code changes
# Build
npm run build

# Deploy
npm run cdk:deploy
```

---

## 📊 CDK Commands

```powershell
# View CloudFormation template
npm run cdk:synth

# Compare deployed stack with current state
npm run cdk:diff

# Deploy stack
npm run cdk:deploy

# Destroy stack (delete all resources)
npm run cdk:destroy

# List all stacks
cdk list

# View stack outputs
aws cloudformation describe-stacks --stack-name ContentStudioStack --query 'Stacks[0].Outputs'
```

---

## 🎯 Advantages of CDK over SAM

### Type Safety
```typescript
// CDK (TypeScript) - IDE autocomplete & type checking
const fn = new lambda.Function(this, 'MyFunction', {
  runtime: lambda.Runtime.NODEJS_20_X,  // Autocomplete!
  timeout: cdk.Duration.minutes(5),     // Type-safe!
});
```

vs

```yaml
# SAM (YAML) - No type checking, manual typing
WorkflowFunction:
  Type: AWS::Serverless::Function
  Properties:
    Runtime: nodejs20.x  # Easy to typo
    Timeout: 300         # Have to remember it's seconds
```

### Reusability
```typescript
// Create reusable constructs
class MyApiStack extends Stack {
  createApiRoute(path: string, handler: Function) {
    // Reusable logic
  }
}
```

### Programmatic
```typescript
// Use loops, conditions, etc.
for (const env of ['dev', 'prod']) {
  new ContentStudioStack(app, `Stack-${env}`, {
    environment: env
  });
}
```

### Better IDE Support
- IntelliSense/autocomplete
- Go to definition
- Refactoring tools
- Compile-time error checking

---

## 🔧 Configuration

### Change Environment

```powershell
# Deploy to dev
npm run cdk:deploy -- --context environment=dev

# Deploy to prod (default)
npm run cdk:deploy
```

### Change Region

```powershell
# Deploy to different region
$env:CDK_DEFAULT_REGION="us-west-2"
npm run cdk:deploy
```

### Update Lambda Memory/Timeout

Edit `cdk/content-studio-stack.ts`:

```typescript
const workflowFunction = new lambda.Function(this, 'WorkflowFunction', {
  // ...
  timeout: cdk.Duration.minutes(10), // Increase to 10 minutes
  memorySize: 2048,                  // Increase to 2GB
});
```

Then redeploy:

```powershell
npm run cdk:deploy
```

---

## 📈 Monitoring

### View Logs

```powershell
# View Lambda logs
aws logs tail /aws/lambda/ai-content-studio-prod --follow

# View API Gateway logs
aws logs tail <log-group-name> --follow
```

### CloudWatch Console

1. Go to [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. Click **Logs** → **Log groups**
3. Find `/aws/lambda/ai-content-studio-prod`

---

## 🧹 Cleanup

```powershell
# Delete all resources
npm run cdk:destroy

# Confirm deletion when prompted
```

---

## 🆚 CDK vs SAM Comparison

| Feature | AWS CDK | AWS SAM |
|---------|---------|---------|
| **Language** | TypeScript, Python, Java, C# | YAML |
| **Type Safety** | ✅ Full | ❌ None |
| **IDE Support** | ✅ Excellent | ⚠️ Limited |
| **Learning Curve** | Medium | Easy |
| **Flexibility** | ✅ High | ⚠️ Medium |
| **Reusability** | ✅ Constructs | ⚠️ Templates |
| **Testing** | ✅ Unit tests | ❌ Limited |
| **Community** | Growing | Mature |

---

## 🔒 Security Best Practices

### 1. Don't Commit Secrets

```powershell
# Use AWS Secrets Manager
aws secretsmanager create-secret `
  --name /ai-content-studio/openai-key `
  --secret-string "sk-your-key"
```

Then update stack:

```typescript
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

const secret = secretsmanager.Secret.fromSecretNameV2(
  this, 'OpenAIKey', '/ai-content-studio/openai-key'
);

environment: {
  OPENAI_API_KEY: secret.secretValue.unsafeUnwrap(),
}
```

### 2. Enable CloudTrail

```typescript
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';

new cloudtrail.Trail(this, 'CloudTrail', {
  bucket: logBucket,
});
```

### 3. Use Least Privilege IAM

CDK automatically creates minimal IAM roles.

---

## 🎓 Learn More

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- [CDK Workshop](https://cdkworkshop.com/)
- [CDK Patterns](https://cdkpatterns.com/)
- [AWS CDK Examples](https://github.com/aws-samples/aws-cdk-examples)

---

## ✅ Next Steps

1. **Deploy**: `npm run cdk:deploy`
2. **Update Frontend**: Edit API endpoint in `index-serverless.html`
3. **Test**: Visit the S3 website URL
4. **Monitor**: Check CloudWatch logs
5. **Iterate**: Make changes and redeploy

---

**Ready to deploy!** 🚀

```powershell
npm install
npm run build
npm run cdk:deploy -- --context openAIApiKey=your-key
```
