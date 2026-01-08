# 🚀 AWS Elastic Beanstalk Deployment Guide

## Prerequisites

1. **AWS Account**: Create one at [aws.amazon.com](https://aws.amazon.com)
2. **Python**: Required for EB CLI (Python 3.7 or later)
3. **AWS CLI**: Install from [aws.amazon.com/cli](https://aws.amazon.com/cli/)
4. **EB CLI**: Elastic Beanstalk Command Line Interface

---

## 🪟 Windows Setup Steps

### Step 1: Install Python (if not installed)

**Option A: Using winget (Windows 11/10 - Recommended & Easiest)**
```powershell
# No admin required! Install Python using Windows Package Manager
winget install Python.Python.3.12

# After installation completes, close and reopen PowerShell
# Then verify:
python --version
pip --version
```

**Option B: Using Chocolatey (Requires Admin)**
```powershell
# IMPORTANT: Right-click PowerShell → "Run as Administrator" first!

# Install Chocolatey (as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Close and reopen PowerShell as Administrator, then:
choco install python -y

# Close and reopen PowerShell (normal), then verify:
python --version
pip --version
```

**Option C: Manual Download (Traditional - No Admin if user install)**
1. Download Python from [python.org/downloads](https://www.python.org/downloads/)
2. Run installer and **check "Add Python to PATH"**
3. Choose "Install for current user only" if you don't have admin rights
4. Verify installation:
```powershell
python --version
pip --version
```

**After any installation method:**
- **Close and reopen PowerShell** for PATH changes to take effect
- If commands still don't work, restart your computer

---

**💡 Recommended:** Try **Option A (winget)** first - it's the easiest and doesn't require administrator permissions!

### Step 2: Install AWS CLI for Windows

**Option A: MSI Installer (Recommended)**
1. Download: [AWS CLI MSI Installer](https://awscli.amazonaws.com/AWSCLIV2.msi)
2. Run the installer
3. Verify in PowerShell:
```powershell
aws --version
```

**Option B: Using pip**
```powershell
pip install awscli --upgrade
```

### Step 3: Install EB CLI

```powershell
# Install EB CLI
pip install awsebcli --upgrade

# Verify installation
eb --version
```

**⚠️ If you get "pip is not recognized" error:**

```powershell
# Check if Python is installed
python --version

# If Python is installed, use python -m pip instead
python -m pip install awsebcli --upgrade

# Or use py launcher (Windows)
py -m pip install awsebcli --upgrade
```

**If Python is not installed**, go back to Step 1 and install Python first.

### Step 4: Configure AWS Credentials

```powershell
# Configure AWS CLI with your credentials
aws configure
```

You'll be prompted to enter:
- **AWS Access Key ID**: Get from [AWS IAM Console](https://console.aws.amazon.com/iam/home#/security_credentials)
- **AWS Secret Access Key**: Provided when you create access key
- **Default region**: `us-east-1` (or your preferred region)
- **Default output format**: `json`

### Step 5: Initialize Your Project

```powershell
# Navigate to your project
cd "c:\VS Code Workspace\ContentManagementAgentsTS"

# Initialize Elastic Beanstalk
eb init
```

Follow the interactive prompts:
1. **Select a default region**: Choose closest to you (e.g., `1) us-east-1`)
2. **Enter Application Name**: `ai-content-studio`
3. **Select a platform**: Choose `Node.js`
4. **Select a platform branch**: `Node.js 18 running on 64bit Amazon Linux 2023`
5. **Set up SSH**: `y` (recommended for troubleshooting)

### Step 6: Set Environment Variables

```powershell
# Set your OpenAI API key
eb setenv OPENAI_API_KEY=sk-your-actual-key-here

# Verify it's set
eb printenv
```

### Step 7: Create Environment and Deploy

```powershell
# Create production environment (takes 5-10 minutes)
eb create ai-content-studio-prod --instance-type t3.small

# Monitor deployment
eb status
```

### Step 8: Open Your Application

```powershell
# Open in browser
eb open

# Or get the URL
eb status
```

Your app will be live at:
```
http://ai-content-studio-prod.us-east-1.elasticbeanstalk.com
```

---

## 📝 Common Windows Commands

### Deploy Updates
```powershell
eb deploy
```

### View Logs
```powershell
eb logs
```

### Check Health
```powershell
eb health --refresh
```

### SSH into Instance
```powershell
eb ssh
```

### Terminate Environment
```powershell
eb terminate ai-content-studio-prod
```

---

## ⚠️ Windows Troubleshooting

### "pip is not recognized" Error

**Fix Option 1: Use python -m pip**
```powershell
# Instead of: pip install awsebcli --upgrade
# Use:
python -m pip install awsebcli --upgrade
```

**Fix Option 2: Add Python to PATH**
1. Find your Python installation path:
   ```powershell
   where python
   # Example: C:\Users\YourName\AppData\Local\Programs\Python\Python311
   ```

2. Add to PATH:
   - Press `Win + X` → System
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", select "Path" → Edit
   - Add two entries:
     - `C:\Users\YourName\AppData\Local\Programs\Python\Python311`
     - `C:\Users\YourName\AppData\Local\Programs\Python\Python311\Scripts`
   - Click OK, restart PowerShell

3. Verify:
   ```powershell
   pip --version
   ```

**Fix Option 3: Reinstall Python**
- Download from [python.org](https://www.python.org/downloads/)
- Run installer
- ✅ **Check "Add Python to PATH"** (important!)
- Complete installation
- Restart PowerShell

### EB CLI not recognized
```powershell
# Use full path to eb
python -m eb --version

# Or add Scripts folder to PATH
# Add: C:\Users\YourName\AppData\Local\Programs\Python\Python3X\Scripts
```

### Permission errors
```powershell
# Run PowerShell as Administrator
# Right-click PowerShell > Run as Administrator
```

### AWS credentials error
```powershell
# Re-run configure
aws configure

# Or check credentials file
notepad %USERPROFILE%\.aws\credentials
```

---

## 🐧 macOS/Linux Setup (Quick Reference)

### Install EB CLI

```bash
# macOS/Linux
pip3 install awsebcli --upgrade

# Verify installation
eb --version
```

## Step 1: Configure AWS Credentials

```bash
# Configure AWS CLI with your credentials
aws configure
```

Enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Default output format: `json`

## Step 2: Initialize Elastic Beanstalk

```bash
# Initialize EB in your project directory
cd "c:\VS Code Workspace\ContentManagementAgentsTS"
eb init

# Follow the prompts:
# 1. Select region (e.g., us-east-1)
# 2. Create new application: "ai-content-studio"
# 3. Select platform: Node.js
# 4. Platform branch: Node.js 18 running on 64bit Amazon Linux 2023
# 5. Do you want to set up SSH: yes (recommended)
```

## Step 3: Set Environment Variables

Create a file named `env.yaml` (do NOT commit this file):

```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    OPENAI_API_KEY: "your-openai-api-key-here"
    NODE_ENV: "production"
    PORT: "8080"
```

Then apply it:

```bash
eb setenv OPENAI_API_KEY=your-actual-key-here
```

Or use AWS Console:
1. Go to Elastic Beanstalk Console
2. Select your application
3. Go to Configuration → Software
4. Add environment properties

## Step 4: Create Environment and Deploy

```bash
# Create production environment
eb create ai-content-studio-prod

# This will:
# - Create a new environment
# - Deploy your application
# - Set up load balancer
# - Configure auto-scaling
# - Enable WebSocket support

# Wait for deployment (5-10 minutes)
```

## Step 5: Open Your Application

```bash
# Open in browser
eb open

# Or check status
eb status
```

Your app will be available at:
```
http://ai-content-studio-prod.us-east-1.elasticbeanstalk.com
```

## Subsequent Deployments

After making changes:

```bash
# Deploy updates
eb deploy

# Check logs if needed
eb logs

# Monitor health
eb health
```

## Configuration Files Explained

### `.ebextensions/nodecommand.config`
- Sets Node.js command to run
- Configures environment variables
- Sets PORT to 8080 (required by EB)

### `.ebextensions/01_websocket.config`
- Configures Nginx for WebSocket support
- Essential for Socket.IO to work
- Sets up proxy for real-time connections

### `.ebignore`
- Excludes files from deployment
- Similar to `.gitignore`
- Reduces upload size

### `package.json` scripts
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "postinstall": "npm run build"
  }
}
```

## Important Notes

### 1. Port Configuration
Elastic Beanstalk requires your app to listen on port **8080**. Our `src/server.ts` already uses `process.env.PORT || 3000`, so it will automatically use 8080 on EB.

### 2. WebSocket Support
The `.ebextensions/01_websocket.config` file configures Nginx to support WebSocket connections, which is crucial for Socket.IO.

### 3. Build Process
EB will run `npm install` and then `npm run build` automatically. Make sure your TypeScript compiles successfully.

### 4. Environment Variables
Never commit `.env` files. Always use:
```bash
eb setenv KEY=value
```

### 5. CORS Configuration
Update `src/server.ts` CORS settings for production:

```typescript
cors: {
  origin: "https://your-eb-url.elasticbeanstalk.com",
  methods: ["GET", "POST"]
}
```

## Monitoring & Logs

```bash
# View recent logs
eb logs

# Tail logs in real-time
eb logs --stream

# Check health status
eb health

# Open health dashboard
eb console
```

## Scaling Configuration

To handle more traffic:

```bash
# Scale to 2-4 instances
eb scale 4

# Or configure auto-scaling in AWS Console:
# Configuration → Capacity → Auto Scaling Group
```

## Cost Estimation

**Basic Setup (Single Instance):**
- t3.small instance: ~$15-20/month
- Load Balancer: ~$16/month
- Data transfer: Variable

**Production Setup (Auto-scaling):**
- 2-4 t3.medium instances: ~$60-120/month
- Load Balancer: ~$16/month
- Data transfer: Variable

**Free Tier:**
- 750 hours/month of t2.micro or t3.micro (first year)
- Perfect for testing!

## Troubleshooting

### Deployment Fails

```bash
# Check logs
eb logs

# SSH into instance
eb ssh

# Check Node.js version
node --version

# Check if app is running
pm2 list
```

### WebSocket Issues

1. Verify `01_websocket.config` is applied:
```bash
eb ssh
cat /etc/nginx/conf.d/websocket.conf
```

2. Check Nginx status:
```bash
sudo service nginx status
```

3. Test WebSocket connection from browser console:
```javascript
const socket = io('https://your-app.elasticbeanstalk.com');
socket.on('connect', () => console.log('Connected!'));
```

### Environment Variables Not Set

```bash
# List all env variables
eb printenv

# Set individual variables
eb setenv OPENAI_API_KEY=sk-...

# Or use env.yaml file
eb deploy --env-group-suffix prod
```

## Custom Domain (Optional)

1. Go to AWS Route 53
2. Create hosted zone for your domain
3. Add CNAME record pointing to EB URL
4. Update CORS in `src/server.ts`

## CI/CD Integration (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Elastic Beanstalk

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Generate deployment package
      run: zip -r deploy.zip . -x '*.git*'
    
    - name: Deploy to EB
      uses: einaregilsson/beanstalk-deploy@v21
      with:
        aws_access_key: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws_secret_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        application_name: ai-content-studio
        environment_name: ai-content-studio-prod
        version_label: ${{ github.sha }}
        region: us-east-1
        deployment_package: deploy.zip
```

## Cleanup / Termination

When done testing:

```bash
# Terminate environment (keeps application)
eb terminate ai-content-studio-prod

# Delete entire application
aws elasticbeanstalk delete-application --application-name ai-content-studio
```

## Alternative: Docker-based Deployment

If you prefer Docker, create `Dockerfile` and use:

```bash
eb init --platform docker
```

## Security Best Practices

1. **Enable HTTPS**: Use AWS Certificate Manager (free)
2. **Restrict CORS**: Update allowed origins
3. **Use Secrets Manager**: For sensitive env variables
4. **Enable CloudWatch**: For monitoring and alerts
5. **Set up backups**: If using database later

## Support

- AWS Documentation: [docs.aws.amazon.com/elasticbeanstalk](https://docs.aws.amazon.com/elasticbeanstalk)
- EB CLI Guide: [docs.aws.amazon.com/eb-cli](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html)
- Community: [forums.aws.amazon.com](https://forums.aws.amazon.com)

---

**Ready to deploy!** 🚀

Start with: `eb init` and follow the steps above.
