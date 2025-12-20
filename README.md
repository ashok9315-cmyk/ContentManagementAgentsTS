# Multi-Agent Content Management System (TypeScript)

A sophisticated content management automation system using **LangChain.js** and **LangGraph.js** that generates both **Markdown** and **beautiful HTML** content.

## ✨ Features

- 🔍 **Research Agent**: Gathers comprehensive information on topics
- ✍️ **Content Writer Agent**: Creates high-quality articles
- 📝 **Editor Agent**: Reviews and improves content quality
- 🔎 **SEO Optimizer Agent**: Optimizes for search engines
- 📤 **Publisher Agent**: Handles final formatting and publishing
- 🌐 **HTML Publisher Agent**: Converts markdown to beautiful, responsive HTML pages
- 🔄 **Integrated Workflow**: Automatic markdown + HTML generation
- 📊 **State Management**: Tracks workflow progress through each phase

## 🏗️ Architecture

### Agents
Each agent is a specialized AI with specific responsibilities:

1. **ResearchAgent** - Information gathering and topic analysis
2. **WriterAgent** - Creative content generation
3. **EditorAgent** - Grammar, style, and coherence refinement
4. **SEOAgent** - Search engine optimization
5. **PublisherAgent** - Final formatting and metadata preparation
6. **HTMLPublisherAgent** - Converts markdown to visually appealing HTML

### Workflow
The **LangGraph** workflow orchestrates agents in a sequential pipeline:
```
Research → Write → Edit → SEO Optimize → Publish (MD + HTML)
```

## 📦 Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo-preview
TEMPERATURE=0.7
```

## 🚀 Usage

### Interactive Mode (Generates Markdown + HTML)
```bash
npm start
# or
npm run dev
```
Enter a topic and get both markdown and HTML output automatically!

### Demo Mode (with sample topics)
```bash
npm run demo
```

### Specific Workflows
```bash
# Run standard LangGraph workflow (markdown only)
npm run langgraph

# Run enhanced workflow (explicit markdown + HTML)
npm run enhanced

# Convert existing markdown files to HTML
npm run html

# Quick HTML demo with sample content
npm run demo-html
```

### Production
```bash
npm run build
npm start
```

## 📁 Project Structure

```
ContentManagementAgentsTS/
├── src/
│   ├── agents/
│   │   ├── researchAgent.ts
│   │   ├── writerAgent.ts
│   │   ├── editorAgent.ts
│   │   ├── seoAgent.ts
│   │   ├── publisherAgent.ts
│   │   └── htmlPublisherAgent.ts
│   ├── workflows/
│   │   ├── langgraphWorkflow.ts
│   │   └── enhancedWorkflow.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── index.ts
│   ├── convertToHTML.ts
│   └── demoHTMLPublisher.ts
├── output/
│   ├── langgraph/      # Markdown files
│   └── html/           # HTML files with index
├── package.json
├── tsconfig.json
├── README.md
├── HTML_PUBLISHER.md   # HTML Publisher documentation
├── QUICK_START_HTML.md
└── SYSTEM_OVERVIEW.md
```

## 💡 Quick Start Example

```bash
# 1. Install and configure
npm install
# Add your OpenAI API key to .env

# 2. Run interactive mode
npm start

# 3. Enter a topic (e.g., "Machine Learning in Healthcare")

# 4. View your content:
#    - Markdown: output/langgraph/*.md
#    - HTML: output/html/*.html
#    - Index: output/html/index.html (open in browser!)
```

## 📤 Output

Generated content is saved to the `output/` directory:

### Markdown Output (`output/langgraph/`)
- Front matter metadata (title, date, keywords, etc.)
- SEO-optimized content
- Reading time estimate
- Proper formatting

### HTML Output (`output/html/`)
- Beautiful, responsive HTML pages
- Embedded CSS styling
- Mobile-friendly design
- Index page for easy navigation
- Professional layout and typography
- Gradient backgrounds
- Hover effects and animations

**💡 Tip**: Open `output/html/index.html` in your browser to see all your articles!

## 🎨 HTML Features

The HTML output includes:
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Professional styling with embedded CSS
- ✅ SEO-friendly meta tags
- ✅ Beautiful typography
- ✅ Index page with statistics
- ✅ Card-based article grid
- ✅ Reading time and metadata display
- ✅ Keyword tags

See [HTML_PUBLISHER.md](HTML_PUBLISHER.md) for detailed HTML publishing documentation.

## 📋 Available Commands

| Command | Description | Output |
|---------|-------------|--------|
| `npm start` | Interactive mode with HTML | Markdown + HTML |
| `npm run dev` | Same as start | Markdown + HTML |
| `npm run demo` | Demo with sample topics | Markdown + HTML |
| `npm run langgraph` | Standard workflow | Markdown only |
| `npm run enhanced` | Enhanced workflow | Markdown + HTML |
| `npm run html` | Convert existing MD to HTML | HTML only |
| `npm run demo-html` | HTML demo with sample | HTML only |
| `npm run build` | Build TypeScript | Compiled JS |

## 🔧 Requirements

- Node.js 18+ or 20+
- OpenAI API key
- TypeScript 5+

## 📚 Documentation

- **[README.md](README.md)** - Main documentation (this file)
- **[HTML_PUBLISHER.md](HTML_PUBLISHER.md)** - HTML publisher details
- **[QUICK_START_HTML.md](QUICK_START_HTML.md)** - HTML quick start guide
- **[SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md)** - Complete system overview

## 🤝 Contributing

This is a demonstration project showcasing multi-agent workflows with LangChain.js and LangGraph.js.

## 📄 License

MIT

## License

MIT
