# Build script for AWS Lambda deployment (Windows)

Write-Host "🔨 Building Lambda function..." -ForegroundColor Cyan

# Clean previous build
if (Test-Path dist) {
    Remove-Item -Recurse -Force dist
}
if (Test-Path lambda.zip) {
    Remove-Item -Force lambda.zip
}

# Build TypeScript
Write-Host "📦 Compiling TypeScript..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript compilation failed!" -ForegroundColor Red
    exit 1
}

# Copy package.json to dist
Copy-Item package.json dist/

# Install production dependencies in dist
Push-Location dist
Write-Host "📥 Installing production dependencies..." -ForegroundColor Yellow
npm install --production --omit=dev

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

# Create deployment package using Compress-Archive
Write-Host "🗜️ Creating deployment package..." -ForegroundColor Yellow
Compress-Archive -Path dist\* -DestinationPath lambda.zip -Force

Write-Host "✅ Build complete! lambda.zip is ready for deployment" -ForegroundColor Green

$size = (Get-Item lambda.zip).Length / 1MB
Write-Host "📦 Package size: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
