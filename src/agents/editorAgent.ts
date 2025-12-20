/**
 * Editor Agent - Reviews and improves content
 */
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import type { EditorOutput, AgentConfig } from '../types/index.js';

export class EditorAgent {
  private llm: ChatOpenAI;
  private modelName: string;
  private temperature: number;

  constructor(config: AgentConfig = {}) {
    this.modelName = config.modelName || process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    this.temperature = config.temperature ?? 0.5;
    
    this.llm = new ChatOpenAI({
      modelName: this.modelName,
      temperature: this.temperature,
    });
  }

  private createPrompt(): ChatPromptTemplate {
    return ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are a meticulous content editor with expertise in:
1. Grammar and spelling correction
2. Style and tone consistency
3. Clarity and readability improvement
4. Structure and flow optimization
5. Fact-checking and accuracy

Your job is to polish content while preserving the author's voice.
Provide the edited version without commentary.`,
      ],
      [
        'human',
        `Edit the following article for publication:

Original Content:
{content}

Focus on:
- Grammar and spelling
- Sentence structure and clarity
- Logical flow and transitions
- Removing redundancies
- Maintaining engaging tone

Provide the edited version ready for publishing.`,
      ],
    ]);
  }

  async edit(content: string): Promise<EditorOutput> {
    console.log('\n📝 EDITING PHASE');

    const prompt = this.createPrompt();
    const chain = prompt.pipe(this.llm);

    const result = await chain.invoke({ content });

    return {
      originalContent: content,
      editedContent: result.content as string,
      improvements: 'Grammar, clarity, and flow improved',
      status: 'edited',
    };
  }

  async run(content: string): Promise<string> {
    const result = await this.edit(content);
    return result.editedContent;
  }
}
