/**
 * AWS Lambda Handler for Content Workflow
 * Supports both API Gateway events and direct invocation
 * Implements async job pattern with S3 storage for long-running tasks
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { EnhancedContentWorkflow, setGlobalEmitter } from '../workflows/enhancedWorkflow.js';
import { EventEmitter } from 'events';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const RESULTS_BUCKET = process.env.RESULTS_BUCKET || 'ai-content-studio-prod-790756194179';

// Global event emitter for agent progress
const agentEmitter = new EventEmitter();
setGlobalEmitter(agentEmitter);

// CORS headers for all responses
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
  'Access-Control-Allow-Credentials': 'true',
};

// Type guard to check if event is from API Gateway
function isAPIGatewayEvent(event: any): event is APIGatewayProxyEvent {
  return event && typeof event === 'object' && 'httpMethod' in event && 'path' in event;
}

// JSON response helper
function createJSONResponse(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
    body: JSON.stringify(body),
  };
}

/**
 * Lambda Handler - Supports both API Gateway and Direct Invocation
 */
export const handler = async (
  event: APIGatewayProxyEvent | { topic: string; publishHTML?: boolean; outputDir?: string }
): Promise<APIGatewayProxyResult | any> => {
  console.log('📥 Lambda invoked:', event);

  // Check if this is a direct invocation (simple JSON with topic)
  if (!isAPIGatewayEvent(event)) {
    console.log('🔧 Direct invocation detected');
    const directEvent = event as { topic: string; publishHTML?: boolean; outputDir?: string };
    
    if (!directEvent.topic || directEvent.topic.trim() === '') {
      return {
        success: false,
        error: 'Topic is required'
      };
    }

    try {
      console.log(`🚀 Starting workflow for topic: ${directEvent.topic}`);

      // Collect progress events
      const progressEvents: any[] = [];

      // Listen to agent events
      const agentListener = (data: any) => {
        progressEvents.push({ type: 'agent-progress', data });
      };

      const statusListener = (data: any) => {
        progressEvents.push({ type: 'status-update', data });
      };

      agentEmitter.on('agent-progress', agentListener);
      agentEmitter.on('status-update', statusListener);

      // Run workflow
      const workflow = new EnhancedContentWorkflow();
      const result = await workflow.run(directEvent.topic, {
        publishHTML: directEvent.publishHTML ?? true,
        outputDir: directEvent.outputDir ?? 'output',
        saveFiles: false,
      });

      // Clean up listeners
      agentEmitter.off('agent-progress', agentListener);
      agentEmitter.off('status-update', statusListener);

      // Return direct response (no API Gateway wrapping)
      return {
        success: true,
        topic: directEvent.topic,
        markdown: {
          content: result.markdown.formattedContent,
          metadata: result.markdown.metadata,
        },
        html: result.html ? {
          content: result.html.htmlContent,
          metadata: result.html.metadata,
        } : null,
        progressEvents,
        generatedAt: new Date().toISOString(),
      };

    } catch (error: any) {
      console.error('❌ Workflow error:', error);
      console.error('Stack trace:', error.stack);
      
      return {
        success: false,
        error: error.message || 'An error occurred during workflow execution',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
    }
  }

  // API Gateway event handling
  console.log('🌐 API Gateway event detected:', {
    path: event.path,
    method: event.httpMethod,
  });

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  // Health check endpoint
  if (event.path === '/health' && event.httpMethod === 'GET') {
    return createJSONResponse(200, {
      status: 'ok',
      message: 'Lambda function is running',
      timestamp: new Date().toISOString(),
    });
  }

  // Workflow endpoint - Start async job and return immediately
  if (event.path === '/api/workflow' && event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { topic } = body;

      if (!topic || topic.trim() === '') {
        return createJSONResponse(400, { 
          success: false,
          error: 'Topic is required' 
        });
      }

      // Generate unique job ID
      const jobId = randomUUID();
      console.log(`🚀 Starting async workflow for topic: ${topic}, jobId: ${jobId}`);

      // Save initial status to S3
      await s3Client.send(new PutObjectCommand({
        Bucket: RESULTS_BUCKET,
        Key: `jobs/${jobId}.json`,
        ContentType: 'application/json',
        Body: JSON.stringify({
          jobId,
          topic,
          status: 'processing',
          startedAt: new Date().toISOString(),
        }),
      }));

      // Start workflow asynchronously (don't wait)
      runWorkflowAsync(jobId, topic).catch(error => {
        console.error('Async workflow error:', error);
      });

      // Return immediately with job ID
      return createJSONResponse(202, {
        success: true,
        jobId,
        status: 'processing',
        message: 'Workflow started. Use /api/status/{jobId} to check progress.',
        estimatedTime: '2-5 minutes',
      });

    } catch (error: any) {
      console.error('❌ Workflow error:', error);
      return createJSONResponse(500, {
        success: false,
        error: error.message || 'An error occurred',
      });
    }
  }

  // Status check endpoint - Get job status
  if (event.path?.match(/^\/api\/status\/[\w-]+$/) && event.httpMethod === 'GET') {
    try {
      const jobId = event.path.split('/').pop();
      
      // Get job status from S3
      const result = await s3Client.send(new GetObjectCommand({
        Bucket: RESULTS_BUCKET,
        Key: `jobs/${jobId}.json`,
      }));

      const statusData = JSON.parse(await result.Body!.transformToString());
      
      return createJSONResponse(200, statusData);

    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        return createJSONResponse(404, {
          success: false,
          error: 'Job not found',
        });
      }
      
      console.error('❌ Status check error:', error);
      return createJSONResponse(500, {
        success: false,
        error: error.message || 'An error occurred',
      });
    }
  }

  // Legacy synchronous endpoint (will timeout but still works)
  if (event.path === '/api/workflow-sync' && event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { topic } = body;

      if (!topic || topic.trim() === '') {
        return createJSONResponse(400, { 
          success: false,
          error: 'Topic is required' 
        });
      }

      console.log(`🚀 Starting synchronous workflow for topic: ${topic}`);

      // Collect progress events
      const progressEvents: any[] = [];

      // Listen to agent events
      const agentListener = (data: any) => {
        progressEvents.push({ type: 'agent-progress', data });
      };

      const statusListener = (data: any) => {
        progressEvents.push({ type: 'status-update', data });
      };

      agentEmitter.on('agent-progress', agentListener);
      agentEmitter.on('status-update', statusListener);

      // Run workflow
      const workflow = new EnhancedContentWorkflow();
      const result = await workflow.run(topic, {
        publishHTML: true,
        outputDir: 'output',
        saveFiles: false,
      });

      // Clean up listeners
      agentEmitter.off('agent-progress', agentListener);
      agentEmitter.off('status-update', statusListener);

      // Return complete result
      return createJSONResponse(200, {
        success: true,
        topic,
        markdown: {
          content: result.markdown.formattedContent,
          metadata: result.markdown.metadata,
        },
        html: result.html ? {
          content: result.html.htmlContent,
          metadata: result.html.metadata,
        } : null,
        progressEvents,
        generatedAt: new Date().toISOString(),
      });

    } catch (error: any) {
      console.error('❌ Workflow error:', error);
      console.error('Stack trace:', error.stack);
      
      return createJSONResponse(500, {
        success: false,
        error: error.message || 'An error occurred during workflow execution',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }

  // 404 for unknown routes
  return createJSONResponse(404, { 
    success: false,
    error: 'Not Found',
    path: event.path 
  });
};

/**
 * Run workflow asynchronously and save results to S3
 */
async function runWorkflowAsync(jobId: string, topic: string): Promise<void> {
  try {
    console.log(`📝 Running async workflow for job: ${jobId}`);

    // Collect progress events
    const progressEvents: any[] = [];

    // Listen to agent events
    const agentListener = (data: any) => {
      progressEvents.push({ type: 'agent-progress', data });
    };

    const statusListener = (data: any) => {
      progressEvents.push({ type: 'status-update', data });
    };

    agentEmitter.on('agent-progress', agentListener);
    agentEmitter.on('status-update', statusListener);

    // Run workflow
    const workflow = new EnhancedContentWorkflow();
    const result = await workflow.run(topic, {
      publishHTML: true,
      outputDir: 'output',
      saveFiles: false,
    });

    // Clean up listeners
    agentEmitter.off('agent-progress', agentListener);
    agentEmitter.off('status-update', statusListener);

    // Save complete result to S3
    const finalResult = {
      jobId,
      topic,
      status: 'completed',
      success: true,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      markdown: {
        content: result.markdown.formattedContent,
        metadata: result.markdown.metadata,
      },
      html: result.html ? {
        content: result.html.htmlContent,
        metadata: result.html.metadata,
      } : null,
      progressEvents,
    };

    await s3Client.send(new PutObjectCommand({
      Bucket: RESULTS_BUCKET,
      Key: `jobs/${jobId}.json`,
      ContentType: 'application/json',
      Body: JSON.stringify(finalResult),
    }));

    console.log(`✅ Async workflow completed for job: ${jobId}`);

  } catch (error: any) {
    console.error(`❌ Async workflow failed for job: ${jobId}`, error);

    // Save error status to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: RESULTS_BUCKET,
      Key: `jobs/${jobId}.json`,
      ContentType: 'application/json',
      Body: JSON.stringify({
        jobId,
        topic,
        status: 'failed',
        success: false,
        error: error.message,
        failedAt: new Date().toISOString(),
      }),
    }));
  }
}
