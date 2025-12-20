/**
 * Writer Agent - Creates content based on research
 */
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import type { WriterOutput, AgentConfig } from '../types/index.js';

export class WriterAgent {
  private llm: ChatOpenAI;
  private modelName: string;
  private temperature: number;

  constructor(config: AgentConfig = {}) {
    this.modelName = config.modelName || process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    this.temperature = config.temperature ?? 0.7;
    
    this.llm = new ChatOpenAI({
      modelName: this.modelName,
      temperature: this.temperature,
    });
  }

  private createPrompt(): ChatPromptTemplate {
    return ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are an expert content writer with years of experience.
Your role is to:
1. Write engaging, clear, and informative content
2. Maintain a consistent tone and style
3. Structure content logically with proper headings
4. Use compelling introductions and conclusions
5. Include relevant examples and explanations

Write in a professional yet accessible style.`,
      ],
      [
        'human',
        `Based on the following research, write a comprehensive article:

Research Brief:
{research}

Topic: {topic}
Target Length: {length} words

Create a well-structured article with:
- Engaging title
- Introduction
- Main body with sections
- Conclusion`,
      ],
    ]);
  }

  async write(topic: string, research: string, length: number = 800): Promise<WriterOutput> {
    console.log('\n✍️ WRITING PHASE');
    console.log(`Target length: ${length} words`);

    const prompt = this.createPrompt();
    const chain = prompt.pipe(this.llm);

    const result = await chain.invoke({
      topic,
      research,
      length: length.toString(),
    });

    const content = result.content as string;
    const wordCount = content.split(/\s+/).length;

    return {
      topic,
      content,
      wordCount,
      status: 'draft',
    };
  }

  async run(topic: string, research: string, length: number = 800): Promise<string> {
    const result = await this.write(topic, research, length);
    return result.content;
  }
}
