/**
 * Research Agent - Gathers information on topics
 */
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import type { ResearchOutput, AgentConfig } from '../types/index.js';

export class ResearchAgent {
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
        `You are a professional research agent specializing in content research.
Your role is to:
1. Understand the topic thoroughly
2. Identify key aspects and subtopics
3. Gather relevant facts and data
4. Organize findings logically
5. Provide comprehensive research briefs

Be thorough, accurate, and cite your sources when possible.`,
      ],
      [
        'human',
        `Research the following topic and provide a comprehensive brief:

Topic: {topic}

Include:
- Overview and background
- Key points and subtopics
- Current trends
- Target audience considerations
- Potential angles for content creation

Provide a detailed research report.`,
      ],
    ]);
  }

  async research(topic: string): Promise<ResearchOutput> {
    console.log('\n🔍 RESEARCH PHASE');
    console.log(`Topic: ${topic}`);

    const prompt = this.createPrompt();
    const chain = prompt.pipe(this.llm);

    const result = await chain.invoke({ topic });

    return {
      topic,
      researchContent: result.content as string,
      keyPoints: this.extractKeyPoints(result.content as string),
      status: 'completed',
    };
  }

  private extractKeyPoints(content: string): string[] {
    // Simple extraction - in production, use more sophisticated parsing
    const lines = content.split('\n');
    return lines
      .filter((line) => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map((line) => line.trim().substring(1).trim())
      .slice(0, 5);
  }

  async run(topic: string): Promise<string> {
    const result = await this.research(topic);
    return result.researchContent;
  }
}
