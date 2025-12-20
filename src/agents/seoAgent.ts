/**
 * SEO Optimizer Agent - Optimizes content for search engines
 */
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import type { SEOOutput, AgentConfig } from '../types/index.js';

export class SEOAgent {
  private llm: ChatOpenAI;
  private modelName: string;
  private temperature: number;

  constructor(config: AgentConfig = {}) {
    this.modelName = config.modelName || process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    this.temperature = config.temperature ?? 0.4;
    
    this.llm = new ChatOpenAI({
      modelName: this.modelName,
      temperature: this.temperature,
    });
  }

  private createPrompt(): ChatPromptTemplate {
    return ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are an SEO specialist expert in optimizing content for search engines.
Your responsibilities include:
1. Keyword optimization and placement
2. Meta description creation
3. Header structure (H1, H2, H3) optimization
4. Internal linking suggestions
5. Readability scoring
6. SEO-friendly URL suggestions

Optimize content while maintaining natural readability.`,
      ],
      [
        'human',
        `Optimize the following content for SEO:

Content:
{content}

Topic: {topic}

Provide:
1. SEO-optimized version of the content
2. Meta description (150-160 characters)
3. Focus keywords (3-5)
4. SEO score and recommendations
5. Suggested slug/URL

Format your response as:
[OPTIMIZED CONTENT]
<content here>

[META DESCRIPTION]
<meta description>

[KEYWORDS]
<keywords>

[SEO RECOMMENDATIONS]
<recommendations>

[SLUG]
<suggested-url-slug>`,
      ],
    ]);
  }

  async optimize(content: string, topic: string): Promise<SEOOutput> {
    console.log('\n🔎 SEO OPTIMIZATION PHASE');

    const prompt = this.createPrompt();
    const chain = prompt.pipe(this.llm);

    const result = await chain.invoke({ content, topic });
    const output = result.content as string;

    return {
      optimizedContent: this.extractSection(output, 'OPTIMIZED CONTENT'),
      metaDescription: this.extractSection(output, 'META DESCRIPTION'),
      keywords: this.parseKeywords(this.extractSection(output, 'KEYWORDS')),
      recommendations: this.extractSection(output, 'SEO RECOMMENDATIONS'),
      slug: this.extractSection(output, 'SLUG'),
      status: 'seo_optimized',
    };
  }

  private extractSection(text: string, sectionName: string): string {
    try {
      const startMarker = `[${sectionName}]`;
      const startIndex = text.indexOf(startMarker);
      
      if (startIndex === -1) {
        return text;
      }

      const contentStart = startIndex + startMarker.length;
      const nextSectionIndex = text.indexOf('[', contentStart);
      
      const section = nextSectionIndex === -1
        ? text.substring(contentStart).trim()
        : text.substring(contentStart, nextSectionIndex).trim();

      return section;
    } catch {
      return text;
    }
  }

  private parseKeywords(keywordsText: string): string[] {
    return keywordsText
      .split(/[,\n]/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0)
      .slice(0, 5);
  }

  async run(content: string, topic: string): Promise<string> {
    const result = await this.optimize(content, topic);
    return result.optimizedContent;
  }
}
