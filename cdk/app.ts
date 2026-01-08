#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ContentStudioStack } from './content-studio-stack';

const app = new cdk.App();

new ContentStudioStack(app, 'ContentStudioStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'AI Content Studio - Serverless Architecture (Lambda + API Gateway + S3)',
});

app.synth();
