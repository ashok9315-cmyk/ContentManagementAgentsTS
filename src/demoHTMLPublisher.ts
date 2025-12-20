/**
 * Demo: HTML Publisher with Sample Content
 * Run: tsx src/demoHTMLPublisher.ts
 */
import 'dotenv/config';
import { HTMLPublisherAgent } from './agents/htmlPublisherAgent.js';
import type { ContentMetadata } from './types/index.js';

const sampleMarkdown = `# The Future of Artificial Intelligence in Healthcare

Artificial Intelligence (AI) is revolutionizing the healthcare industry, offering unprecedented opportunities to improve patient care, streamline operations, and accelerate medical research.

## Introduction

The integration of AI in healthcare represents one of the most significant technological advancements of our time. From diagnosis to treatment planning, AI is transforming how medical professionals work and how patients receive care.

## Key Applications

### Medical Diagnosis

AI-powered diagnostic tools can analyze medical images, lab results, and patient data with remarkable accuracy. Machine learning algorithms have shown the ability to detect diseases like cancer, diabetic retinopathy, and heart conditions often earlier than traditional methods.

### Drug Discovery

Pharmaceutical companies are leveraging AI to accelerate drug discovery and development. AI can analyze vast amounts of biological data to identify potential drug candidates, predict their effectiveness, and optimize clinical trial designs.

### Personalized Treatment

AI enables personalized medicine by analyzing individual patient data, genetic information, and treatment outcomes to recommend tailored treatment plans that maximize effectiveness and minimize side effects.

### Healthcare Operations

AI improves hospital operations through:
- Predictive scheduling and resource allocation
- Patient flow optimization
- Supply chain management
- Administrative task automation

## Benefits and Challenges

### Benefits

1. **Improved Accuracy**: AI systems can process and analyze data at scales impossible for humans
2. **Cost Reduction**: Automation of routine tasks reduces operational costs
3. **Accessibility**: AI-powered telemedicine extends healthcare to remote areas
4. **Research Acceleration**: AI speeds up medical research and clinical trials

### Challenges

1. **Data Privacy**: Protecting sensitive patient information
2. **Regulatory Compliance**: Navigating complex healthcare regulations
3. **Integration**: Incorporating AI into existing healthcare systems
4. **Trust and Adoption**: Building confidence among healthcare providers and patients

## The Road Ahead

The future of AI in healthcare is incredibly promising. As technology continues to evolve, we can expect:

- More accurate predictive models for disease prevention
- Enhanced robotic surgery capabilities
- Real-time health monitoring through wearable devices
- Advanced natural language processing for medical documentation

## Conclusion

AI is not replacing healthcare professionals but rather augmenting their capabilities. The successful integration of AI in healthcare requires collaboration between technologists, medical professionals, regulators, and patients. As we move forward, the focus must remain on using AI to enhance patient care while maintaining the human touch that is essential to medicine.

The revolution has begun, and the possibilities are endless.`;

async function runDemo() {
  console.log('🎬 HTML Publisher Demo\n');
  console.log('This demo will create a sample HTML article from markdown content.\n');

  // Initialize HTML Publisher
  const htmlPublisher = new HTMLPublisherAgent({
    temperature: 0.3,
  });

  // Create sample metadata
  const metadata: ContentMetadata = {
    title: 'The Future of Artificial Intelligence in Healthcare',
    slug: 'future-ai-healthcare',
    metaDescription: 'Explore how artificial intelligence is revolutionizing healthcare through improved diagnostics, personalized treatment, drug discovery, and operational efficiency.',
    keywords: [
      'Artificial Intelligence',
      'Healthcare',
      'Medical Diagnosis',
      'Drug Discovery',
      'Personalized Medicine',
      'Healthcare Technology'
    ],
    publishedDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    status: 'published',
    wordCount: 450,
    readingTime: 3,
    author: 'AI Content System'
  };

  console.log('📝 Article Details:');
  console.log(`   Title: ${metadata.title}`);
  console.log(`   Words: ${metadata.wordCount}`);
  console.log(`   Reading Time: ${metadata.readingTime} minutes`);
  console.log(`   Keywords: ${metadata.keywords.join(', ')}\n`);

  try {
    // Publish to HTML
    const result = await htmlPublisher.publish(
      sampleMarkdown,
      metadata,
      'output/demo-html'
    );

    console.log('\n✅ Demo Complete!\n');
    console.log('📊 Results:');
    console.log(`   File: ${result.fileName}`);
    console.log(`   Path: ${result.filePath}`);
    console.log(`   Size: ${(result.htmlContent.length / 1024).toFixed(2)} KB`);
    console.log(`   Has CSS: ${result.metadata.hasEmbeddedCSS ? '✓' : '✗'}`);
    console.log(`   Responsive: ${result.metadata.isResponsive ? '✓' : '✗'}`);

    console.log('\n🌐 Next Steps:');
    console.log(`   1. Open: ${result.filePath}`);
    console.log('   2. View in your browser');
    console.log('   3. Enjoy your beautiful article!\n');

    // Create a simple index for the demo
    console.log('📑 Creating demo index page...');
    await htmlPublisher.createIndexPage(
      [{ metadata: result.metadata, fileName: result.fileName }],
      'output/demo-html'
    );
    
    console.log('✅ Index page created at: output/demo-html/index.html\n');

    console.log('🎉 Demo finished successfully!');
    console.log('💡 Tip: Open output/demo-html/index.html in your browser to see the result.\n');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    throw error;
  }
}

// Run the demo
runDemo()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
