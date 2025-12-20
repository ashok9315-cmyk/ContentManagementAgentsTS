# HTML Publisher Agent - Quick Start Examples

## Example 1: Convert Existing Markdown to HTML

If you already have markdown files in `output/langgraph/`, convert them all to HTML:

```bash
npm run html
```

This will:
- Read all `.md` files from `output/langgraph/`
- Convert each to beautiful HTML
- Save to `output/html/`
- Create an index page at `output/html/index.html`

Then open `output/html/index.html` in your browser to see your articles!

## Example 2: Generate New Content with HTML

Run the enhanced workflow that creates both markdown and HTML:

```bash
npm run enhanced
```

This runs the complete pipeline:
1. **Research** the topic using AI
2. **Write** a comprehensive article
3. **Edit** for quality and clarity
4. **Optimize** for SEO
5. **Publish** as markdown
6. **Convert** to HTML

## Example 3: Programmatic Usage

Create a custom script:

```typescript
import { HTMLPublisherAgent } from './agents/htmlPublisherAgent';
import { readFileSync } from 'fs';

const htmlPublisher = new HTMLPublisherAgent();

// Read your markdown
const markdownContent = readFileSync('my-article.md', 'utf-8');

// Create metadata
const metadata = {
  title: 'My Amazing Article',
  slug: 'my-amazing-article',
  metaDescription: 'An insightful article about amazing things',
  keywords: ['amazing', 'article', 'insights'],
  publishedDate: new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }),
  status: 'published',
  wordCount: 1500,
  readingTime: 8,
  author: 'Your Name'
};

// Publish to HTML
const result = await htmlPublisher.publish(
  markdownContent,
  metadata,
  'output/html'
);

console.log(`✅ Published to: ${result.filePath}`);
```

## What You Get

### HTML Features
- ✨ Beautiful, modern design
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎨 Professional color schemes
- 💅 Embedded CSS (no external files needed)
- ⚡ Fast loading
- ♿ Accessible HTML5 semantic markup

### Index Page Features
- 📊 Statistics dashboard
- 🃏 Card-based article grid
- 🔍 Metadata display
- 🏷️ Keyword tags
- 🎨 Gradient backgrounds
- 🖱️ Hover effects

## File Structure After Running

```
output/
├── langgraph/
│   ├── article-1.md
│   └── article-2.md
└── html/
    ├── index.html          ← Open this in your browser!
    ├── article-1.html
    └── article-2.html
```

## Tips

1. **Quick Preview**: Just open `output/html/index.html` in any browser
2. **Deploy Anywhere**: Upload the `html` folder to any web host
3. **Customize**: Edit the CSS in the generated files
4. **Batch Process**: Convert multiple articles efficiently

## Troubleshooting

**Q: No markdown files found?**
- Run `npm run langgraph` first to generate some content

**Q: Want to customize the styling?**
- Edit the system prompt in `src/agents/htmlPublisherAgent.ts`
- Modify the CSS in the generated HTML files

**Q: Need a different design?**
- Adjust the `temperature` parameter for more creative styling
- Lower temperature (0.1-0.3) = more consistent design
- Higher temperature (0.5-0.7) = more varied designs

## Next Steps

1. Generate some content: `npm run langgraph`
2. Convert to HTML: `npm run html`
3. Open `output/html/index.html` in your browser
4. Enjoy your beautiful articles! 🎉
