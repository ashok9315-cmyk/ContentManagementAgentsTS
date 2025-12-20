/**
 * Type definitions for the content management system
 */

export interface ResearchOutput {
  topic: string;
  researchContent: string;
  keyPoints: string[];
  status: 'completed';
}

export interface WriterOutput {
  topic: string;
  content: string;
  wordCount: number;
  status: 'draft';
}

export interface EditorOutput {
  originalContent: string;
  editedContent: string;
  improvements: string;
  status: 'edited';
}

export interface SEOOutput {
  optimizedContent: string;
  metaDescription: string;
  keywords: string[];
  recommendations: string;
  slug: string;
  status: 'seo_optimized';
}

export interface PublisherOutput {
  formattedContent: string;
  metadata: ContentMetadata;
  status: 'ready_to_publish';
}

export interface HTMLPublisherOutput {
  htmlContent: string;
  filePath: string;
  fileName: string;
  metadata: ContentMetadata & {
    format: 'html';
    hasEmbeddedCSS: boolean;
    isResponsive: boolean;
  };
  status: 'published';
}

export interface ContentMetadata {
  title: string;
  slug: string;
  metaDescription: string;
  keywords: string[];
  publishedDate: string;
  status: string;
  wordCount: number;
  readingTime: number;
  author?: string;
}

export interface WorkflowState {
  topic: string;
  researchOutput?: string;
  draftContent?: string;
  editedContent?: string;
  seoContent?: string;
  seoMetadata?: Partial<SEOOutput>;
  finalOutput?: PublisherOutput;
  currentStep: string;
  messages: string[];
}

export interface AgentConfig {
  modelName?: string;
  temperature?: number;
}
