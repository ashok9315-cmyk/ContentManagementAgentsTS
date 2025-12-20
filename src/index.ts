/**
 * Main Application - Multi-Agent Content Management System
 * TypeScript implementation using LangChain.js and LangGraph.js
 */
import 'dotenv/config';
import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { LangGraphContentWorkflow } from './workflows/langgraphWorkflow.js';
import { PublisherAgent } from './agents/publisherAgent.js';
import { HTMLPublisherAgent } from './agents/htmlPublisherAgent.js';
import { printBanner, validateApiKeys } from './utils/helpers.js';

async function runLangGraphWorkflow(topic: string): Promise<void> {
  console.log('\n🔷 Running Enhanced Workflow (Markdown + HTML)\n');

  const workflow = new LangGraphContentWorkflow();
  const result = await workflow.run(topic);

  // Save markdown output
  const publisher = new PublisherAgent();
  const filename = publisher.saveToFile(result, 'output/langgraph');
  console.log(`\n📄 Markdown saved to: ${filename}`);

  // Generate HTML output
  console.log('\n🌐 Generating HTML version...');
  const htmlPublisher = new HTMLPublisherAgent();
  try {
    const htmlResult = await htmlPublisher.publish(
      result.formattedContent,
      result.metadata,
      'output/html'
    );
    console.log(`✅ HTML saved to: ${htmlResult.filePath}`);
  } catch (error) {
    console.error('❌ HTML generation failed:', error);
  }
}

async function interactiveMode(): Promise<void> {
  printBanner();

  // Validate API keys
  if (!validateApiKeys()) {
    console.log('\n❌ Please configure your API keys in .env file');
    return;
  }

  console.log('\n📝 Interactive Content Management System');
  console.log('='.repeat(60));

  const rl = createInterface({ input, output });

  try {
    // Get topic from user
    const topic = await rl.question('\nEnter the content topic: ');

    if (!topic.trim()) {
      console.log('❌ No topic provided. Exiting...');
      return;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Starting workflow for topic: ${topic}`);
    console.log('='.repeat(60));

    await runLangGraphWorkflow(topic);

    console.log('\n' + '='.repeat(60));
    console.log('✅ WORKFLOW COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log('\n📁 Output files:');
    console.log('   📄 Markdown: output/langgraph/');
    console.log('   🌐 HTML: output/html/');
    console.log('\n💡 Tip: Open output/html/index.html in your browser to view all articles');

  } catch (error) {
    console.error('\n❌ Error occurred:', error);
  } finally {
    rl.close();
  }
}

async function demoMode(): Promise<void> {
  printBanner();

  if (!validateApiKeys()) {
    console.log('\n❌ Please configure your API keys in .env file');
    return;
  }

  const demoTopics = [
    'The Future of Artificial Intelligence in Healthcare',
    'Sustainable Energy Solutions for Smart Cities',
    'The Impact of Quantum Computing on Data Security',
  ];

  console.log('\n🎯 DEMO MODE - Running with sample topics');
  console.log('='.repeat(60));

  for (let i = 0; i < demoTopics.length; i++) {
    const topic = demoTopics[i];
    
    console.log(`\n\n${'='.repeat(60)}`);
    console.log(`DEMO ${i + 1}/${demoTopics.length}: ${topic}`);
    console.log('='.repeat(60));

    try {
      await runLangGraphWorkflow(topic);
      console.log(`\n✅ Demo ${i + 1} completed!`);
    } catch (error) {
      console.error(`\n❌ Error in demo ${i + 1}:`, error);
      continue;
    }
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('✅ ALL DEMOS COMPLETED');
  console.log('='.repeat(60));
  console.log('\n📁 Output files:');
  console.log('   📄 Markdown: output/langgraph/');
  console.log('   🌐 HTML: output/html/');
  console.log('\n💡 Tip: Open output/html/index.html in your browser to view all articles');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    if (args[0] === '--demo') {
      await demoMode();
    } else if (args[0] === '--help') {
      printBanner();
      console.log('\nUsage:');
      console.log('  npm run dev              Run in interactive mode');
      console.log('  npm run demo             Run demo with sample topics');
      console.log('  npm run dev -- --help    Show this help message');
      console.log('  npm run dev -- <topic>   Generate content for specific topic');
    } else {
      // Treat arguments as topic
      const topic = args.join(' ');
      printBanner();
      console.log(`\n📝 Topic: ${topic}`);
      await runLangGraphWorkflow(topic);
    }
  } else {
    await interactiveMode();
  }
}

main().catch(console.error);
