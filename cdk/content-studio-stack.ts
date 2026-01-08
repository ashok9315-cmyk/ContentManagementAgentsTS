import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';

export interface ContentStudioStackProps extends cdk.StackProps {
  environment?: string;
  openAIApiKey?: string;
}

export class ContentStudioStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: ContentStudioStackProps) {
    super(scope, id, props);

    const environment = props?.environment || 'prod';
    
    // Get OpenAI API Key from context or environment variable
    const openAIApiKey = 
      this.node.tryGetContext('openAIApiKey') || 
      process.env.OPENAI_API_KEY ||
      props?.openAIApiKey;

    if (!openAIApiKey) {
      throw new Error('OpenAI API Key is required. Set via --context openAIApiKey=xxx or OPENAI_API_KEY env var');
    }

    // Lambda Function
    const workflowFunction = new lambda.Function(this, 'WorkflowFunction', {
      functionName: `ai-content-studio-${environment}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambda/workflow.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      timeout: cdk.Duration.minutes(5),
      memorySize: 1024,
      environment: {
        NODE_ENV: 'production',
        OPENAI_API_KEY: openAIApiKey,
        OPENAI_MODEL: 'gpt-4-turbo-preview',
        TEMPERATURE: '0.7',
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      description: 'AI Content Generation Workflow with SSE',
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'ContentAPI', {
      restApiName: `ai-content-studio-api-${environment}`,
      description: 'AI Content Studio API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
      deployOptions: {
        stageName: environment,
        throttlingRateLimit: 50,
        throttlingBurstLimit: 100,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
    });

    // Lambda Integration
    const lambdaIntegration = new apigateway.LambdaIntegration(workflowFunction);

    // API Routes
    const healthResource = api.root.addResource('health');
    healthResource.addMethod('GET', lambdaIntegration);

    const apiResource = api.root.addResource('api');
    const workflowResource = apiResource.addResource('workflow');
    workflowResource.addMethod('POST', lambdaIntegration);
    workflowResource.addMethod('OPTIONS', lambdaIntegration);

    // S3 Bucket for Static Website
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `ai-content-studio-${environment}-${this.account}`,
      websiteIndexDocument: 'index-serverless.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev/test only
      autoDeleteObjects: true, // For dev/test only
    });

    // Deploy static website files
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../public'))],
      destinationBucket: websiteBucket,
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint URL',
      exportName: `${this.stackName}-ApiEndpoint`,
    });

    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: websiteBucket.bucketWebsiteUrl,
      description: 'S3 Website URL',
      exportName: `${this.stackName}-WebsiteURL`,
    });

    new cdk.CfnOutput(this, 'LambdaFunctionArn', {
      value: workflowFunction.functionArn,
      description: 'Lambda Function ARN',
      exportName: `${this.stackName}-FunctionArn`,
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: websiteBucket.bucketName,
      description: 'S3 Bucket Name',
      exportName: `${this.stackName}-BucketName`,
    });

    // Tags
    cdk.Tags.of(this).add('Application', 'AIContentStudio');
    cdk.Tags.of(this).add('Environment', environment);
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
  }
}
