# AI Content Studio

A serverless AI-powered content generation platform that transforms ideas into professional, SEO-optimized articles and web content.

## About

AI Content Studio uses a multi-agent workflow system to research, write, edit, optimize, and publish high-quality content automatically. Built on AWS serverless architecture (Lambda, S3, CloudFront, API Gateway), it delivers fast, scalable, and cost-effective content creation.

## Features

- **Multi-Agent Workflow**: Six specialized AI agents work together
  - Research Agent: Gathers comprehensive topic information
  - Writer Agent: Creates engaging, well-structured content
  - Editor Agent: Refines and polishes the writing
  - SEO Agent: Optimizes for search engines
  - Publisher Agent: Formats for publication
  - HTML Publisher Agent: Generates beautiful web-ready HTML

- **Serverless Architecture**: 
  - AWS Lambda for compute
  - S3 for storage and hosting
  - CloudFront CDN for global delivery
  - API Gateway for REST endpoints

- **Async Processing**: Handles long-running workflows (2-5 minutes) with job-based polling

- **Custom Domain**: Production-ready with SSL certificate

- **CI/CD Pipeline**: Automated GitHub Actions deployment with frontend-only optimization

## Technology Stack

- **Backend**: TypeScript, Node.js 20.x, ES Modules
- **Infrastructure**: AWS CDK
- **AI**: OpenAI GPT models
- **Deployment**: GitHub Actions, AWS CloudFormation
- **Frontend**: Vanilla HTML/CSS/JavaScript

## Live URL

 [https://ai-content-studio.solutionsynth.cloud](https://ai-content-studio.solutionsynth.cloud)
