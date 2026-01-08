#!/bin/bash

# Build script for AWS Lambda deployment
echo "🔨 Building Lambda function..."

# Clean previous build
rm -rf dist
rm -f lambda.zip

# Build TypeScript
echo "📦 Compiling TypeScript..."
npm run build

# Copy package.json to dist
cp package.json dist/

# Install production dependencies in dist
cd dist
echo "📥 Installing production dependencies..."
npm install --production --omit=dev

# Create deployment package
echo "🗜️ Creating deployment package..."
zip -r ../lambda.zip .

cd ..
echo "✅ Build complete! lambda.zip is ready for deployment"
echo "📦 Package size: $(du -h lambda.zip | cut -f1)"
