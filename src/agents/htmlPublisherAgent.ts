/**
 * HTML Publisher Agent - Converts markdown to visually appealing HTML
 */
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { HTMLPublisherOutput, ContentMetadata, AgentConfig } from '../types/index.js';

export class HTMLPublisherAgent {
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
        `You are an expert HTML/CSS designer specializing in creating visually appealing, responsive web content.
Your tasks include:
1. Convert markdown to semantic HTML5
2. Add modern, responsive CSS styling
3. Ensure excellent typography and readability
4. Create mobile-friendly responsive designs
5. Add subtle animations and transitions
6. Use professional color schemes and spacing

Design principles to follow:
- Clean, modern aesthetic
- Excellent readability with proper line-height and spacing
- Professional color palette (consider using CSS variables)
- Responsive design that works on all devices
- Accessible HTML with proper semantic tags
- Beautiful typography with web-safe or Google Fonts
- Subtle hover effects and transitions

IMPORTANT: Return ONLY the complete HTML content as a single string. Do not include any JSON formatting, explanations, or markdown code blocks.`,
      ],
      [
        'human',
        `Convert the following markdown article into a beautiful, visually appealing HTML page:

Markdown Content:
{content}

Metadata:
Title: {title}
Meta Description: {metaDescription}
Keywords: {keywords}
Author: {author}
Date: {date}

Create a complete, standalone HTML document with:
1. Proper DOCTYPE, head, and meta tags
2. Embedded CSS (in <style> tag) with modern, professional styling
3. Responsive design that looks great on all devices
4. Beautiful typography and spacing
5. A hero section for the title
6. Well-formatted article content with proper heading hierarchy
7. Optional: add a subtle gradient background or professional color scheme

Return ONLY the complete HTML content without any JSON or markdown formatting.`,
      ],
    ]);
  }

  async publish(
    markdownContent: string,
    metadata: ContentMetadata,
    outputDir: string = 'output/html'
  ): Promise<HTMLPublisherOutput> {
    console.log('\n📄 Converting markdown to HTML...');

    const prompt = this.createPrompt();
    const chain = prompt.pipe(this.llm);

    const response = await chain.invoke({
      content: markdownContent,
      title: metadata.title,
      metaDescription: metadata.metaDescription,
      keywords: metadata.keywords.join(', '),
      author: metadata.author || 'Content Management System',
      date: metadata.publishedDate,
    });

    let htmlContent = response.content as string;
    
    // Clean up any markdown code blocks if LLM included them
    htmlContent = htmlContent
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Ensure the HTML starts with DOCTYPE
    if (!htmlContent.toLowerCase().includes('<!doctype')) {
      htmlContent = '<!DOCTYPE html>\n' + htmlContent;
    }

    // Save to file
    const fileName = `${metadata.slug}.html`;
    const filePath = this.saveToFile(htmlContent, fileName, outputDir);

    console.log(`✅ HTML published successfully to: ${filePath}`);
    console.log(`📊 HTML size: ${(htmlContent.length / 1024).toFixed(2)} KB`);

    return {
      htmlContent,
      filePath,
      fileName,
      metadata: {
        ...metadata,
        format: 'html',
        hasEmbeddedCSS: htmlContent.includes('<style>'),
        isResponsive: htmlContent.toLowerCase().includes('viewport'),
      },
      status: 'published',
    };
  }

  private saveToFile(
    htmlContent: string,
    fileName: string,
    outputDir: string
  ): string {
    try {
      mkdirSync(outputDir, { recursive: true });
      const filePath = join(outputDir, fileName);
      writeFileSync(filePath, htmlContent, 'utf-8');
      return filePath;
    } catch (error) {
      console.error('Error saving HTML file:', error);
      throw error;
    }
  }

  /**
   * Publish HTML without saving to file (for API responses)
   */
  async publishWithoutSaving(
    markdownContent: string,
    metadata: ContentMetadata
  ): Promise<HTMLPublisherOutput> {
    console.log('\n📄 Converting markdown to HTML...');

    const prompt = this.createPrompt();
    const response = await prompt.pipe(this.llm).invoke({
      content: markdownContent,  // Match the prompt variable name
      title: metadata.title,
      metaDescription: metadata.metaDescription,
      keywords: metadata.keywords.join(', '),
      author: metadata.author || 'Content Management System',
      date: metadata.publishedDate,
    });

    let htmlContent = response.content as string;

    // Clean up any markdown code block markers
    htmlContent = htmlContent
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Ensure the HTML starts with DOCTYPE
    if (!htmlContent.toLowerCase().includes('<!doctype')) {
      htmlContent = '<!DOCTYPE html>\n' + htmlContent;
    }

    console.log('✅ HTML generated successfully (not saved to file)');
    console.log(`📊 HTML size: ${(htmlContent.length / 1024).toFixed(2)} KB`);

    return {
      htmlContent,
      filePath: '', // Empty since not saved
      fileName: `${metadata.slug}.html`,
      metadata: {
        ...metadata,
        format: 'html',
        hasEmbeddedCSS: htmlContent.includes('<style>'),
        isResponsive: htmlContent.toLowerCase().includes('viewport'),
      },
      status: 'published',
    };
  }

  /**
   * Batch publish multiple markdown files to HTML
   */
  async publishBatch(
    markdownFiles: Array<{ content: string; metadata: ContentMetadata }>,
    outputDir: string = 'output/html'
  ): Promise<HTMLPublisherOutput[]> {
    console.log(`\n🚀 Publishing ${markdownFiles.length} markdown files to HTML...`);

    const results: HTMLPublisherOutput[] = [];

    for (let i = 0; i < markdownFiles.length; i++) {
      const file = markdownFiles[i];
      console.log(`\nProcessing ${i + 1}/${markdownFiles.length}: ${file.metadata.title}`);
      
      try {
        const result = await this.publish(file.content, file.metadata, outputDir);
        results.push(result);
      } catch (error) {
        console.error(`Error publishing ${file.metadata.title}:`, error);
      }
    }

    console.log(`\n✅ Successfully published ${results.length} HTML files`);
    return results;
  }

  /**
   * Create an index page for all published articles
   */
  async createIndexPage(
    articles: Array<{ metadata: ContentMetadata; fileName: string }>,
    outputDir: string = 'output/html'
  ): Promise<string> {
    console.log('\n📑 Creating index page...');

    const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Published Articles - Content Management System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 3rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            color: #667eea;
            text-align: center;
        }
        
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 3rem;
            font-size: 1.1rem;
        }
        
        .articles-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .article-card {
            background: #f9f9f9;
            border-radius: 12px;
            padding: 1.5rem;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid #eee;
        }
        
        .article-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .article-card h2 {
            font-size: 1.3rem;
            margin-bottom: 0.5rem;
            color: #333;
        }
        
        .article-card a {
            text-decoration: none;
            color: #667eea;
            font-weight: 600;
        }
        
        .article-card a:hover {
            color: #764ba2;
        }
        
        .article-meta {
            font-size: 0.85rem;
            color: #666;
            margin: 0.5rem 0;
        }
        
        .article-description {
            color: #555;
            font-size: 0.95rem;
            margin-top: 0.75rem;
            line-height: 1.5;
        }
        
        .article-keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .keyword {
            background: #667eea;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
        }
        
        .stats {
            display: flex;
            justify-content: center;
            gap: 3rem;
            margin-bottom: 3rem;
            padding: 1.5rem;
            background: #f0f0f0;
            border-radius: 12px;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            color: #667eea;
        }
        
        .stat-label {
            color: #666;
            margin-top: 0.25rem;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 1.5rem;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            .articles-grid {
                grid-template-columns: 1fr;
            }
            
            .stats {
                flex-direction: column;
                gap: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 Published Articles</h1>
        <p class="subtitle">Content Management System - Article Library</p>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number">${articles.length}</div>
                <div class="stat-label">Total Articles</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${articles.reduce((sum, a) => sum + a.metadata.wordCount, 0).toLocaleString()}</div>
                <div class="stat-label">Total Words</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${Math.round(articles.reduce((sum, a) => sum + a.metadata.readingTime, 0))} min</div>
                <div class="stat-label">Reading Time</div>
            </div>
        </div>
        
        <div class="articles-grid">
${articles.map(article => `            <div class="article-card">
                <h2><a href="${article.fileName}">${article.metadata.title}</a></h2>
                <div class="article-meta">
                    📅 ${article.metadata.publishedDate} | 
                    📖 ${article.metadata.readingTime} min read | 
                    ✍️ ${article.metadata.wordCount.toLocaleString()} words
                </div>
                <p class="article-description">${article.metadata.metaDescription}</p>
                <div class="article-keywords">
${article.metadata.keywords.map(keyword => `                    <span class="keyword">${keyword}</span>`).join('\n')}
                </div>
            </div>`).join('\n')}
        </div>
    </div>
</body>
</html>`;

    const indexPath = join(outputDir, 'index.html');
    writeFileSync(indexPath, indexHTML, 'utf-8');
    
    console.log(`✅ Index page created at: ${indexPath}`);
    return indexPath;
  }
}
