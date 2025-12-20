/**
 * LangGraph Workflow - Orchestrates agents using LangGraph
 */
import { ResearchAgent } from '../agents/researchAgent.js';
import { WriterAgent } from '../agents/writerAgent.js';
import { EditorAgent } from '../agents/editorAgent.js';
import { SEOAgent } from '../agents/seoAgent.js';
import { PublisherAgent } from '../agents/publisherAgent.js';
import type { PublisherOutput } from '../types/index.js';

export class LangGraphContentWorkflow {
  private researchAgent: ResearchAgent;
  private writerAgent: WriterAgent;
  private editorAgent: EditorAgent;
  private seoAgent: SEOAgent;
  private publisherAgent: PublisherAgent;

  constructor() {
    this.researchAgent = new ResearchAgent();
    this.writerAgent = new WriterAgent();
    this.editorAgent = new EditorAgent();
    this.seoAgent = new SEOAgent();
    this.publisherAgent = new PublisherAgent();
  }

  async run(topic: string): Promise<PublisherOutput> {
    console.log(`\n${'='.repeat(60)}`);
    console.log('🚀 STARTING CONTENT MANAGEMENT WORKFLOW');
    console.log(`${'='.repeat(60)}`);

    // Research Phase
    console.log('\n🔍 RESEARCH PHASE');
    console.log(`Topic: ${topic}`);
    const researchOutput = await this.researchAgent.run(topic);

    // Writing Phase
    console.log('\n✍️ WRITING PHASE');
    const draftContent = await this.writerAgent.run(topic, researchOutput);

    // Editing Phase
    console.log('\n📝 EDITING PHASE');
    const editedContent = await this.editorAgent.run(draftContent);

    // SEO Optimization Phase
    console.log('\n🔎 SEO OPTIMIZATION PHASE');
    const seoResult = await this.seoAgent.optimize(editedContent, topic);

    // Publishing Phase
    console.log('\n📤 PUBLISHING PHASE');
    const finalOutput = await this.publisherAgent.publish(
      seoResult.optimizedContent,
      topic,
      seoResult.metaDescription,
      seoResult.keywords,
      seoResult.slug
    );

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ WORKFLOW COMPLETED');
    console.log(`${'='.repeat(60)}\n`);

    return finalOutput;
  }
}

// Example usage
async function main() {
  const workflow = new LangGraphContentWorkflow();
  
  const topic = 'The Future of Artificial Intelligence in Healthcare';
  const result = await workflow.run(topic);

  console.log('\n' + '='.repeat(60));
  console.log('FINAL OUTPUT');
  console.log('='.repeat(60));
  console.log('\nFormatted Content:');
  console.log(result.formattedContent);
  console.log('\nMetadata:');
  console.log(JSON.stringify(result.metadata, null, 2));

  // Save to file
  const publisher = new PublisherAgent();
  const filename = publisher.saveToFile(result);
  console.log(`\n📁 Saved to: ${filename}`);
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
