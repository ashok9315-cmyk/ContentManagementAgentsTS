/**
 * Express Server with WebSocket Support for Real-time Agent Progress
 */
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { EnhancedContentWorkflow, setGlobalEmitter } from './workflows/enhancedWorkflow.js';
import { EventEmitter } from 'events';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

// Global event emitter for agent progress
export const agentEmitter = new EventEmitter();

// Set the global emitter for the workflow
setGlobalEmitter(agentEmitter);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Forward agent events to connected clients
  const agentListener = (data: any) => {
    socket.emit('agent-progress', data);
  };

  const statusListener = (data: any) => {
    socket.emit('status-update', data);
  };

  const errorListener = (data: any) => {
    socket.emit('error', data);
  };

  const completeListener = (data: any) => {
    socket.emit('workflow-complete', data);
  };

  agentEmitter.on('agent-progress', agentListener);
  agentEmitter.on('status-update', statusListener);
  agentEmitter.on('error', errorListener);
  agentEmitter.on('workflow-complete', completeListener);

  // Handle workflow start request
  socket.on('start-workflow', async (data: { topic: string }) => {
    const { topic } = data;
    
    if (!topic || topic.trim() === '') {
      socket.emit('error', { message: 'Topic is required' });
      return;
    }

    console.log(`🚀 Starting workflow for topic: ${topic}`);
    console.log(`💾 Save files: false (disabled)`);
    
    try {
      agentEmitter.emit('status-update', {
        status: 'starting',
        message: 'Initializing workflow...'
      });

      const workflow = new EnhancedContentWorkflow();
      const result = await workflow.run(topic, {
        publishHTML: true,
        outputDir: 'output',
        saveFiles: false  // Never save files
      });

      agentEmitter.emit('workflow-complete', {
        markdown: result.markdown,
        html: result.html,
        message: 'Workflow completed successfully!'
      });

    } catch (error: any) {
      console.error('❌ Workflow error:', error);
      agentEmitter.emit('error', {
        message: error.message || 'An error occurred during workflow execution'
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
    agentEmitter.off('agent-progress', agentListener);
    agentEmitter.off('status-update', statusListener);
    agentEmitter.off('error', errorListener);
    agentEmitter.off('workflow-complete', completeListener);
  });
});

// API Routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.post('/api/workflow', async (req, res) => {
  const { topic } = req.body;

  if (!topic || topic.trim() === '') {
    return res.status(400).json({ error: 'Topic is required' });
  }

  return res.json({ 
    message: 'Workflow started',
    topic: topic 
  });

  // Workflow will be handled via WebSocket
});

/**
 * Generate content API - Returns JSON without saving files
 * POST /api/generate
 * Body: { topic: string, saveToFile?: boolean }
 * Response: { markdown: {...}, html: {...}, metadata: {...} }
 */
app.post('/api/generate', async (req, res) => {
  const { topic, saveToFile = false } = req.body;

  if (!topic || topic.trim() === '') {
    return res.status(400).json({ 
      success: false,
      error: 'Topic is required' 
    });
  }

  console.log(`\n📝 API Request: Generating content for "${topic}"`);
  console.log(`💾 Save to file: ${saveToFile}`);

  try {
    const workflow = new EnhancedContentWorkflow();
    const result = await workflow.run(topic, {
      publishHTML: true,
      outputDir: 'output',
      saveFiles: saveToFile  // Only save files if explicitly requested
    });

    // Prepare the response
    const response = {
      success: true,
      topic: topic,
      markdown: {
        content: result.markdown.formattedContent,
        metadata: result.markdown.metadata,
        status: result.markdown.status
      },
      html: result.html ? {
        content: result.html.htmlContent,
        metadata: result.html.metadata,
        fileName: result.html.fileName,
        filePath: saveToFile ? result.html.filePath : null,
        status: result.html.status
      } : null,
      metadata: {
        title: result.markdown.metadata.title,
        slug: result.markdown.metadata.slug,
        description: result.markdown.metadata.metaDescription,
        keywords: result.markdown.metadata.keywords,
        publishedDate: result.markdown.metadata.publishedDate,
        wordCount: result.markdown.metadata.wordCount,
        readingTime: Math.ceil(result.markdown.metadata.wordCount / 200) + ' min'
      },
      generatedAt: new Date().toISOString()
    };

    console.log(`✅ Content generated successfully`);
    console.log(`📊 Word count: ${response.metadata.wordCount}`);
    console.log(`📚 Reading time: ${response.metadata.readingTime}`);

    return res.json(response);

  } catch (error: any) {
    console.error('❌ API Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred during content generation',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🌐 Content Management Agent UI Server');
  console.log('='.repeat(60));
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready for real-time updates`);
  console.log('='.repeat(60) + '\n');
});
