/**
 * Helper utilities for content management system
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import type { ContentMetadata } from '../types/index.js';

config();

export interface AppConfig {
  openaiApiKey: string;
  model: string;
  temperature: number;
}

export function loadConfig(): AppConfig {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY not found in environment variables');
  }

  return {
    openaiApiKey,
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
  };
}

export function validateApiKeys(): boolean {
  try {
    loadConfig();
    console.log('✅ All required API keys are configured');
    return true;
  } catch (error) {
    console.error('❌ Missing required API keys:');
    console.error('   - OPENAI_API_KEY');
    console.error('\nPlease set these in your .env file');
    return false;
  }
}

export function saveOutput(
  content: string,
  metadata: ContentMetadata,
  outputDir: string = 'output'
): string {
  try {
    mkdirSync(outputDir, { recursive: true });
  } catch {
    // Directory might already exist
  }

  const slug = metadata.slug || `content-${Date.now()}`;
  const filename = join(outputDir, `${slug}.md`);

  let fileContent = '---\n';
  for (const [key, value] of Object.entries(metadata)) {
    if (Array.isArray(value)) {
      fileContent += `${key}:\n${value.map((v) => `  - ${v}`).join('\n')}\n`;
    } else {
      fileContent += `${key}: ${value}\n`;
    }
  }
  fileContent += '---\n\n';
  fileContent += content;

  writeFileSync(filename, fileContent, 'utf-8');
  console.log(`\n✅ Content saved to: ${filename}`);

  return filename;
}

export function formatMetadata(
  topic: string,
  metaDescription: string = '',
  keywords: string[] = [],
  slug: string = ''
): ContentMetadata {
  return {
    title: topic,
    slug: slug || createSlug(topic),
    metaDescription,
    keywords,
    publishedDate: new Date().toISOString(),
    status: 'published',
    wordCount: 0,
    readingTime: 0,
    author: 'AI Content Team',
  };
}

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function estimateReadingTime(content: string): number {
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / 200));
}

export function printBanner(): void {
  const banner = `
╔══════════════════════════════════════════════════════════╗
║   Multi-Agent Content Management System                  ║
║   Powered by LangChain.js and LangGraph.js              ║
╚══════════════════════════════════════════════════════════╝
  `;
  console.log(banner);
}

export function printWorkflowStatus(step: string, message: string): void {
  const icons: Record<string, string> = {
    research: '🔍',
    writing: '✍️',
    editing: '📝',
    seo: '🔎',
    publishing: '📤',
    complete: '✅',
    error: '❌',
  };

  const icon = icons[step.toLowerCase()] || '📌';
  console.log(`\n${icon} ${step.toUpperCase()}: ${message}`);
}
