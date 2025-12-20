# HTML Publisher Agent 🌐

The HTML Publisher Agent converts markdown content into beautiful, responsive HTML pages with modern styling.

## Features

✨ **Beautiful Design**
- Modern, professional styling with embedded CSS
- Responsive design that works on all devices
- Excellent typography and readability
- Professional color schemes with gradients
- Subtle animations and hover effects

📱 **Responsive**
- Mobile-first design
- Adapts to all screen sizes
- Touch-friendly navigation

🎨 **Customizable**
- Uses AI to generate appropriate styling
- Semantic HTML5 structure
- CSS variables for easy theming
- Professional color palettes

## Usage

### Option 1: Convert Existing Markdown Files

Convert all markdown files in the `output/langgraph` directory to HTML:

```bash
npm run html
```

This will:
1. Read all `.md` files from `output/langgraph/`
2. Convert each to a beautiful HTML page
3. Save to `output/html/`
4. Create an `index.html` page to navigate all articles

### Option 2: Use Enhanced Workflow

Run the complete workflow that generates both markdown and HTML:

```bash
npm run enhanced
```

This workflow:
1. Researches the topic
2. Writes content
3. Edits for quality
4. Optimizes for SEO
5. Publishes as Markdown
6. Converts to HTML

### Option 3: Programmatic Usage

```typescript
import { HTMLPublisherAgent } from './agents/htmlPublisherAgent';
import type { ContentMetadata } from './types/index';

const htmlPublisher = new HTMLPublisherAgent();

const metadata: ContentMetadata = {
  title: 'My Article Title',
  slug: 'my-article-title',
  metaDescription: 'Description of the article',
  keywords: ['AI', 'Technology', 'Innovation'],
  publishedDate: new Date().toLocaleDateString(),
  status: 'published',
  wordCount: 1500,
  readingTime: 8,
  author: 'Your Name',
};

const result = await htmlPublisher.publish(
  markdownContent,
  metadata,
  'output/html'
);

console.log(`Published to: ${result.filePath}`);
```

## Output Structure

```
output/
└── html/
    ├── index.html                              # Index page with all articles
    ├── article-1.html                          # Individual article pages
    ├── article-2.html
    └── article-3.html
```

## Features of Generated HTML

Each HTML page includes:

- ✅ Complete standalone HTML document
- ✅ Responsive meta tags
- ✅ SEO-friendly metadata
- ✅ Embedded CSS (no external stylesheets needed)
- ✅ Beautiful typography
- ✅ Professional color scheme
- ✅ Mobile-responsive design
- ✅ Hover effects and transitions
- ✅ Proper semantic HTML5 structure
- ✅ Accessibility features

## Index Page Features

The generated `index.html` includes:

- 📊 Total article statistics
- 🃏 Beautiful card-based layout
- 🔍 Article metadata (date, reading time, word count)
- 🏷️ Keyword tags
- 🎨 Modern gradient design
- 📱 Fully responsive

## Customization

The HTML Publisher Agent uses AI to generate styling, so it can create different designs based on the content. You can customize the generation by:

1. Modifying the system prompt in `htmlPublisherAgent.ts`
2. Adjusting the temperature setting (lower = more consistent, higher = more creative)
3. Editing the index page template in the `createIndexPage` method

## Example Output

The HTML pages include:

- **Hero section** with article title
- **Metadata section** with date, author, reading time
- **Well-formatted content** with proper heading hierarchy
- **Responsive images** (if included in markdown)
- **Code blocks** with syntax highlighting (if needed)
- **Professional footer** with copyright info

## Browser Compatibility

The generated HTML works in all modern browsers:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Performance

- Lightweight: No external dependencies
- Fast loading: Embedded CSS means fewer HTTP requests
- Optimized: Clean, semantic HTML

## Tips

1. **View in Browser**: Simply open the `index.html` file in your browser to see all articles
2. **Deploy Anywhere**: The HTML files are static and can be hosted on any web server
3. **Customize Styling**: Edit the CSS in the generated files for further customization
4. **Batch Processing**: Use the `publishBatch` method to convert multiple articles efficiently

## Troubleshooting

If you encounter issues:

1. **Missing output folder**: The script automatically creates the `output/html` directory
2. **Large files**: The HTML includes embedded CSS, so files are larger than plain HTML
3. **API rate limits**: Add delays between batch processing (already implemented)

## Examples

See the example files:
- `src/convertToHTML.ts` - Convert existing markdown files
- `src/workflows/enhancedWorkflow.ts` - Full workflow with HTML generation

## Support

For questions or issues, please check the main README or create an issue in the repository.
