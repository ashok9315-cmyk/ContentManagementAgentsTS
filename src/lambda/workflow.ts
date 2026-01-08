/**
 * AWS Lambda Handler for Content Workflow
 * Supports Server-Sent Events (SSE) for real-time progress updates
 */
import 'dotenv/config';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { EnhancedContentWorkflow, setGlobalEmitter } from '../workflows/enhancedWorkflow.js';
import { EventEmitter } from 'events';

// Global event emitter for agent progress
const agentEmitter = new EventEmitter();
setGlobalEmitter(agentEmitter);

// SSE response helper
function createSSEResponse(statusCode: number = 200): Partial<APIGatewayProxyResult> {
  return {
    statusCode,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  };
}

// Format SSE message
function formatSSEMessage(event: string, data: any): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * Lambda Handler for Workflow Execution with SSE
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('📥 Lambda invoked:', {
    path: event.path,
    method: event.httpMethod,
    headers: event.headers,
  });

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: '',
    };
  }

  // Health check endpoint
  if (event.path === '/health' && event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        status: 'ok',
        message: 'Lambda function is running',
        timestamp: new Date().toISOString(),
      }),
    };
  }

  // Workflow endpoint with SSE
  if (event.path === '/api/workflow' && event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { topic } = body;

      if (!topic || topic.trim() === '') {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ error: 'Topic is required' }),
        };
      }

      console.log(`🚀 Starting workflow for topic: ${topic}`);

      // Collect SSE messages
      let sseMessages = '';

      // Listen to agent events
      const agentListener = (data: any) => {
        sseMessages += formatSSEMessage('agent-progress', data);
      };

      const statusListener = (data: any) => {
        sseMessages += formatSSEMessage('status-update', data);
      };

      const errorListener = (data: any) => {
        sseMessages += formatSSEMessage('error', data);
      };

      agentEmitter.on('agent-progress', agentListener);
      agentEmitter.on('status-update', statusListener);
      agentEmitter.on('error', errorListener);

      // Send initial status
      sseMessages += formatSSEMessage('status-update', {
        status: 'starting',
        message: 'Initializing workflow...',
      });

      // Run workflow
      const workflow = new EnhancedContentWorkflow();
      const result = await workflow.run(topic, {
        publishHTML: true,
        outputDir: 'output',
        saveFiles: false,
      });

      // Send completion message
      sseMessages += formatSSEMessage('workflow-complete', {
        markdown: result.markdown,
        html: result.html,
        message: 'Workflow completed successfully!',
      });

      // Send final message to close stream
      sseMessages += formatSSEMessage('done', { message: 'Stream closed' });

      // Clean up listeners
      agentEmitter.off('agent-progress', agentListener);
      agentEmitter.off('status-update', statusListener);
      agentEmitter.off('error', errorListener);

      // Return SSE stream
      return {
        ...createSSEResponse(200),
        body: sseMessages,
      } as APIGatewayProxyResult;

    } catch (error: any) {
      console.error('❌ Workflow error:', error);
      
      const errorMessage = formatSSEMessage('error', {
        message: error.message || 'An error occurred during workflow execution',
      });

      return {
        ...createSSEResponse(500),
        body: errorMessage,
      } as APIGatewayProxyResult;
    }
  }

  // 404 for unknown routes
  return {
    statusCode: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ error: 'Not Found' }),
  };
};
