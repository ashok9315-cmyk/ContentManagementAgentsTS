/**
 * Enhanced Content Workflow with HTML Publishing
 */
import 'dotenv/config';
import { ResearchAgent } from '../agents/researchAgent.js';
import { WriterAgent } from '../agents/writerAgent.js';
import { EditorAgent } from '../agents/editorAgent.js';
import { SEOAgent } from '../agents/seoAgent.js';
import { PublisherAgent } from '../agents/publisherAgent.js';
import { HTMLPublisherAgent } from '../agents/htmlPublisherAgent.js';
import type { PublisherOutput, HTMLPublisherOutput } from '../types/index.js';

export class EnhancedContentWorkflow {
  private researchAgent: ResearchAgent;
  private writerAgent: WriterAgent;
  private editorAgent: EditorAgent;
  private seoAgent: SEOAgent;
  private publisherAgent: PublisherAgent;
  private htmlPublisher: HTMLPublisherAgent;

  constructor() {
    this.researchAgent = new ResearchAgent();
    this.writerAgent = new WriterAgent();
    this.editorAgent = new EditorAgent();
    this.seoAgent = new SEOAgent();
    this.publisherAgent = new PublisherAgent();
    this.htmlPublisher = new HTMLPublisherAgent();
  }

  async run(
    topic: string,
    options: { publishHTML?: boolean; outputDir?: string } = {}
  ): Promise<{
    markdown: PublisherOutput;
    html?: HTMLPublisherOutput;
  }> {
    const { publishHTML = true, outputDir = 'output' } = options;

    console.log(`\n${'='.repeat(60)}`);
    console.log('🚀 STARTING ENHANCED CONTENT WORKFLOW');
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

    // Publishing Phase (Markdown)
    console.log('\n📤 PUBLISHING PHASE - MARKDOWN');
    const markdownOutput = await this.publisherAgent.publish(
      seoResult.optimizedContent,
      topic,
      seoResult.metaDescription,
      seoResult.keywords,
      seoResult.slug
    );

    // Save markdown to file
    console.log('\n💾 Saving markdown file...');
    const publisher = new PublisherAgent();
    const markdownFilename = publisher.saveToFile(markdownOutput);
    console.log(`✅ Markdown saved to: ${markdownFilename}`);

    let htmlOutput: HTMLPublisherOutput | undefined;

    // HTML Publishing Phase (if enabled)
    if (publishHTML) {
      console.log('\n🌐 PUBLISHING PHASE - HTML');
      htmlOutput = await this.htmlPublisher.publish(
        markdownOutput.formattedContent,
        markdownOutput.metadata,
        `${outputDir}/html`
      );
      console.log(`✅ HTML saved to: ${htmlOutput.filePath}`);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ WORKFLOW COMPLETED');
    console.log(`${'='.repeat(60)}\n`);

    return {
      markdown: markdownOutput,
      html: htmlOutput,
    };
  }

  /**
   * Run workflow for multiple topics
   */
  async runBatch(
    topics: string[],
    options: { publishHTML?: boolean; outputDir?: string } = {}
  ): Promise<Array<{ markdown: PublisherOutput; html?: HTMLPublisherOutput }>> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 BATCH PROCESSING ${topics.length} TOPICS`);
    console.log(`${'='.repeat(60)}\n`);

    const results = [];

    for (let i = 0; i < topics.length; i++) {
      console.log(`\n📝 Processing topic ${i + 1}/${topics.length}`);
      console.log(`${'─'.repeat(60)}`);
      
      try {
        const result = await this.run(topics[i], options);
        results.push(result);
      } catch (error) {
        console.error(`❌ Error processing topic "${topics[i]}":`, error);
      }
      
      // Add a small delay between topics to avoid rate limits
      if (i < topics.length - 1) {
        console.log('\n⏳ Waiting 2 seconds before next topic...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Create HTML index page if HTML publishing is enabled
    if (options.publishHTML && results.some(r => r.html)) {
      console.log('\n📑 Creating HTML index page...');
      const htmlArticles = results
        .filter(r => r.html)
        .map(r => ({
          metadata: r.html!.metadata,
          fileName: r.html!.fileName,
        }));

      await this.htmlPublisher.createIndexPage(
        htmlArticles,
        `${options.outputDir || 'output'}/html`
      );
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ BATCH PROCESSING COMPLETED`);
    console.log(`Successfully processed: ${results.length}/${topics.length} topics`);
    console.log(`${'='.repeat(60)}\n`);

    return results;
  }
}

// Example usage
async function main() {
  const workflow = new EnhancedContentWorkflow();

  // Example 1: Single topic with HTML publishing
  console.log('Example 1: Single topic with HTML publishing');
  const result = await workflow.run(
    'The Impact of Quantum Computing on Cybersecurity',
    { publishHTML: true }
  );

  console.log('\n' + '='.repeat(60));
  console.log('FINAL OUTPUT');
  console.log('='.repeat(60));
  console.log('\nMarkdown Metadata:');
  console.log(JSON.stringify(result.markdown.metadata, null, 2));
  
  if (result.html) {
    console.log('\nHTML Output:');
    console.log(`- File: ${result.html.fileName}`);
    console.log(`- Path: ${result.html.filePath}`);
    console.log(`- Size: ${(result.html.htmlContent.length / 1024).toFixed(2)} KB`);
    console.log(`- Has CSS: ${result.html.metadata.hasEmbeddedCSS}`);
    console.log(`- Responsive: ${result.html.metadata.isResponsive}`);
  }

  // Example 2: Batch processing (commented out)
  /*
  console.log('\n\nExample 2: Batch processing multiple topics');
  const topics = [
    'The Future of Renewable Energy',
    'Machine Learning in Healthcare Diagnostics',
    'Blockchain Beyond Cryptocurrency',
  ];
  
  const batchResults = await workflow.runBatch(topics, { 
    publishHTML: true,
    outputDir: 'output'
  });
  
  console.log(`\n✅ Processed ${batchResults.length} articles`);
  */
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default EnhancedContentWorkflow;
