import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      // Use lambda-build directory that includes node_modules
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda-build')),
      timeout: cdk.Duration.minutes(15), // Increased from 5 to 15 minutes
      memorySize: 2048, // Increased from 1024MB to 2048MB for faster execution
      environment: {
        NODE_ENV: 'production',
        OPENAI_API_KEY: openAIApiKey,
        OPENAI_MODEL: 'gpt-4-turbo-preview',
        TEMPERATURE: '0.7',
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      description: 'AI Content Generation Workflow - JSON Response',
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'ContentAPI', {
      restApiName: `ai-content-studio-api-${environment}`,
      description: 'AI Content Studio API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'Authorization',
          'X-Requested-With',
          'X-Amz-Date',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        allowCredentials: true,
      },
      deployOptions: {
        stageName: environment,
        throttlingRateLimit: 50,
        throttlingBurstLimit: 100,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
    });

    // Lambda Integration (proxy mode handles CORS headers from Lambda response)
    const lambdaIntegration = new apigateway.LambdaIntegration(workflowFunction, {
      proxy: true,
    });

    // API Routes
    const healthResource = api.root.addResource('health');
    healthResource.addMethod('GET', lambdaIntegration);

    const apiResource = api.root.addResource('api');
    const workflowResource = apiResource.addResource('workflow');
    workflowResource.addMethod('POST', lambdaIntegration);

    // Status check endpoint with path parameter
    const statusResource = apiResource.addResource('status');
    const statusJobResource = statusResource.addResource('{jobId}');
    statusJobResource.addMethod('GET', lambdaIntegration);

    // Add Gateway Responses for CORS on errors
    // This ensures CORS headers are included even when API Gateway returns errors (504, 500, etc.)
    const corsHeaders = {
      'Access-Control-Allow-Origin': "'*'",
      'Access-Control-Allow-Headers': "'Content-Type,Authorization,X-Requested-With,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'",
      'Access-Control-Allow-Methods': "'GET,POST,OPTIONS,PUT,DELETE'",
      'Access-Control-Allow-Credentials': "'true'",
    };

    // Add CORS headers to common error responses
    api.addGatewayResponse('Default4XX', {
      type: apigateway.ResponseType.DEFAULT_4XX,
      responseHeaders: corsHeaders,
    });

    api.addGatewayResponse('Default5XX', {
      type: apigateway.ResponseType.DEFAULT_5XX,
      responseHeaders: corsHeaders,
    });

    api.addGatewayResponse('Timeout', {
      type: apigateway.ResponseType.INTEGRATION_TIMEOUT,
      responseHeaders: corsHeaders,
    });

    api.addGatewayResponse('Failure', {
      type: apigateway.ResponseType.INTEGRATION_FAILURE,
      responseHeaders: corsHeaders,
    });

    // S3 Bucket for Static Website (private, accessed via CloudFront)
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `ai-content-studio-${environment}-${this.account}`,
      publicReadAccess: false, // CloudFront will access via OAI
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev/test only
      autoDeleteObjects: true, // For dev/test only
    });

    // Grant Lambda read/write access to S3 for job results
    websiteBucket.grantReadWrite(workflowFunction);

    // Add S3 bucket name to Lambda environment
    workflowFunction.addEnvironment('RESULTS_BUCKET', websiteBucket.bucketName);

    // Deploy static website files
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../public'))],
      destinationBucket: websiteBucket,
    });

    // CloudFront Origin Access Identity
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: `OAI for AI Content Studio ${environment}`,
    });

    // Grant CloudFront access to S3
    websiteBucket.grantRead(originAccessIdentity);

    // Custom Domain Configuration
    const domainName = 'ai-content-studio.solutionsynth.cloud';
    const hostedZoneId = 'Z02373041SS8TKQHXZLAR';
    const zoneName = 'solutionsynth.cloud';

    // Look up existing hosted zone
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: hostedZoneId,
      zoneName: zoneName,
    });

    // Create SSL Certificate (must be in us-east-1 for CloudFront)
    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName: domainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      domainNames: [domainName],
      certificate: certificate,
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        compress: true,
      },
      defaultRootObject: 'index-serverless.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index-serverless.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use only North America & Europe
      comment: `AI Content Studio ${environment} Distribution`,
      enabled: true,
    });

    // Route 53 A Record pointing to CloudFront
    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(
        new route53targets.CloudFrontTarget(distribution)
      ),
      comment: 'AI Content Studio CloudFront distribution',
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint URL',
      exportName: `${this.stackName}-ApiEndpoint`,
    });

    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${domainName}`,
      description: 'Custom Domain Website URL',
      exportName: `${this.stackName}-WebsiteURL`,
    });

    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront Distribution URL (HTTPS)',
      exportName: `${this.stackName}-CloudFrontURL`,
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
