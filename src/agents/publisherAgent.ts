/**
 * Publisher Agent - Handles final formatting and publishing
 */
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { PublisherOutput, ContentMetadata, AgentConfig } from '../types/index.js';

export class PublisherAgent {
  private llm: ChatOpenAI;
  private modelName: string;
  private temperature: number;

  constructor(config: AgentConfig = {}) {
    this.modelName = config.modelName || process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    this.temperature = config.temperature ?? 0.3;
    
    this.llm = new ChatOpenAI({
      modelName: this.modelName,
      temperature: this.temperature,
    });
  }

  private createPrompt(): ChatPromptTemplate {
    return ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are a publishing specialist responsible for final content preparation.
Your tasks include:
1. Final formatting (Markdown, HTML, etc.)
2. Adding metadata
3. Quality assurance checks
4. Creating publication-ready versions
5. Generating content summaries

Ensure all content is publication-ready and properly formatted.`,
      ],
      [
        'human',
        `Prepare the following content for publishing:

Content:
{content}

Metadata:
Topic: {topic}
Meta Description: {metaDescription}
Keywords: {keywords}

Create a publication-ready version with:
1. Proper Markdown formatting
2. Metadata block
3. Table of contents (if applicable)
4. Reading time estimate
5. Category suggestions

Return the final formatted content.`,
      ],
    ]);
  }

  async publish(
    content: string,
    topic: string,
    metaDescription: string = '',
    keywords: string[] = [],
    slug: string = ''
  ): Promise<PublisherOutput> {
    console.log('\n📤 PUBLISHING PHASE');

    const prompt = this.createPrompt();
    const chain = prompt.pipe(this.llm);

    const result = await chain.invoke({
      content,
      topic,
      metaDescription,
      keywords: keywords.join(', '),
    });

    const metadata: ContentMetadata = {
      title: topic,
      slug: slug || this.createSlug(topic),
      metaDescription,
      keywords,
      publishedDate: new Date().toISOString(),
      status: 'published',
      wordCount: content.split(/\s+/).length,
      readingTime: this.estimateReadingTime(content),
      author: 'AI Content Team',
    };

    return {
      formattedContent: result.content as string,
      metadata,
      status: 'ready_to_publish',
    };
  }

  private createSlug(topic: string): string {
    return topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private estimateReadingTime(content: string): number {
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.round(wordCount / 200));
  }

  async run(
    content: string,
    topic: string,
    options: { metaDescription?: string; keywords?: string[]; slug?: string } = {}
  ): Promise<string> {
    const result = await this.publish(
      content,
      topic,
      options.metaDescription,
      options.keywords,
      options.slug
    );
    
    return `${result.formattedContent}\n\n---\nMetadata: ${JSON.stringify(result.metadata, null, 2)}`;
  }

  saveToFile(publicationData: PublisherOutput, outputDir: string = 'output'): string {
    try {
      mkdirSync(outputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    const slug = publicationData.metadata.slug;
    const filename = join(outputDir, `${slug}.md`);

    let fileContent = '---\n';
    for (const [key, value] of Object.entries(publicationData.metadata)) {
      if (Array.isArray(value)) {
        fileContent += `${key}:\n${value.map((v) => `  - ${v}`).join('\n')}\n`;
      } else {
        fileContent += `${key}: ${value}\n`;
      }
    }
    fileContent += '---\n\n';
    fileContent += publicationData.formattedContent;

    writeFileSync(filename, fileContent, 'utf-8');
    console.log(`\n✅ Content saved to: ${filename}`);

    return filename;
  }
}
