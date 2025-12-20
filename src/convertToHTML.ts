/**
 * Example: Convert existing markdown files to HTML
 */
import 'dotenv/config';
import { HTMLPublisherAgent } from './agents/htmlPublisherAgent.js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import type { ContentMetadata } from './types/index.js';

async function convertMarkdownToHTML() {
  console.log('🚀 Starting Markdown to HTML conversion...\n');

  // Initialize the HTML Publisher Agent
  const htmlPublisher = new HTMLPublisherAgent({
    temperature: 0.3,
  });

  // Read all markdown files from the output/langgraph directory
  const markdownDir = 'output/langgraph';
  const htmlOutputDir = 'output/html';

  try {
    const files = readdirSync(markdownDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));

    console.log(`Found ${markdownFiles.length} markdown files to convert\n`);

    const articlesToPublish = markdownFiles.map(file => {
      const content = readFileSync(join(markdownDir, file), 'utf-8');
      const fileName = file.replace('.md', '');
      
      // Extract title from the first heading in the markdown
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : fileName.replace(/-/g, ' ');
      
      // Create metadata
      const metadata: ContentMetadata = {
        title: title,
        slug: fileName,
        metaDescription: `Article about ${title}`,
        keywords: extractKeywords(fileName),
        publishedDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        status: 'published',
        wordCount: content.split(/\s+/).length,
        readingTime: Math.ceil(content.split(/\s+/).length / 200),
        author: 'AI Content Agent',
      };

      return { content, metadata };
    });

    // Publish all markdown files to HTML
    const results = await htmlPublisher.publishBatch(articlesToPublish, htmlOutputDir);

    // Create an index page
    const indexArticles = results.map(result => ({
      metadata: result.metadata,
      fileName: result.fileName,
    }));

    await htmlPublisher.createIndexPage(indexArticles, htmlOutputDir);

    console.log('\n✅ All markdown files converted to HTML successfully!');
    console.log(`📂 HTML files are available in: ${htmlOutputDir}`);
    console.log(`🌐 Open index.html in your browser to view all articles`);

  } catch (error) {
    console.error('Error during conversion:', error);
    throw error;
  }
}

function extractKeywords(fileName: string): string[] {
  // Extract keywords from filename
  const words = fileName
    .replace('.md', '')
    .split('-')
    .filter(word => word.length > 3);
  
  return words.slice(0, 5).map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  );
}

// Run the conversion
convertMarkdownToHTML()
  .then(() => {
    console.log('\n🎉 Conversion complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Conversion failed:', error);
    process.exit(1);
  });
