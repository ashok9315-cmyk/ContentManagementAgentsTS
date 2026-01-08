# 📡 Content Management API Documentation

## Overview

This API allows you to generate professional content (markdown, HTML, and metadata) without saving files. Perfect for integrating with your applications, CMS systems, or frontend applications.

## Base URL

```
http://localhost:3000
```

---

## Endpoints

### 1. Health Check

Check if the server is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

### 2. Generate Content API

Generate complete content with markdown, HTML, and metadata in JSON format.

**Endpoint:** `POST /api/generate`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "topic": "Your content topic here",
  "saveToFile": false
}
```

**Parameters:**
- `topic` (string, required): The topic for content generation
- `saveToFile` (boolean, optional): Whether to save files to disk. Default: `false`

**Response (Success - 200):**
```json
{
  "success": true,
  "topic": "Your content topic",
  "markdown": {
    "content": "# Your Title\n\nFull markdown content...",
    "metadata": {
      "title": "Your Title",
      "slug": "your-title",
      "metaDescription": "SEO-optimized description...",
      "keywords": ["keyword1", "keyword2"],
      "publishedDate": "2026-01-08T12:00:00.000Z",
      "status": "published",
      "wordCount": 850
    },
    "status": "ready_to_publish"
  },
  "html": {
    "content": "<!DOCTYPE html><html>...",
    "metadata": {
      "title": "Your Title",
      "slug": "your-title",
      "format": "html",
      "hasEmbeddedCSS": true,
      "isResponsive": true,
      "metaDescription": "SEO-optimized description...",
      "keywords": ["keyword1", "keyword2"],
      "publishedDate": "2026-01-08T12:00:00.000Z",
      "status": "published",
      "wordCount": 850
    },
    "fileName": "your-title.html",
    "filePath": null,
    "status": "published"
  },
  "metadata": {
    "title": "Your Title",
    "slug": "your-title",
    "description": "SEO-optimized description...",
    "keywords": ["keyword1", "keyword2"],
    "publishedDate": "2026-01-08T12:00:00.000Z",
    "wordCount": 850,
    "readingTime": "5 min"
  },
  "generatedAt": "2026-01-08T12:00:00.000Z"
}
```

**Response (Error - 400/500):**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Stack trace (in development mode only)"
}
```

---

## Usage Examples

### cURL

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "The Future of Artificial Intelligence",
    "saveToFile": false
  }'
```

### JavaScript (Fetch API)

```javascript
async function generateContent(topic) {
  const response = await fetch('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: topic,
      saveToFile: false
    })
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Markdown:', data.markdown.content);
    console.log('HTML:', data.html.content);
    console.log('Metadata:', data.metadata);
  } else {
    console.error('Error:', data.error);
  }
  
  return data;
}

// Usage
generateContent('Machine Learning in Healthcare');
```

### JavaScript (Axios)

```javascript
const axios = require('axios');

async function generateContent(topic) {
  try {
    const response = await axios.post('http://localhost:3000/api/generate', {
      topic: topic,
      saveToFile: false
    });

    console.log('Success:', response.data.success);
    console.log('Markdown:', response.data.markdown.content);
    console.log('HTML:', response.data.html.content);
    console.log('Metadata:', response.data.metadata);

    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
generateContent('Blockchain Technology Explained');
```

### Python (Requests)

```python
import requests
import json

def generate_content(topic, save_to_file=False):
    url = 'http://localhost:3000/api/generate'
    payload = {
        'topic': topic,
        'saveToFile': save_to_file
    }
    
    response = requests.post(url, json=payload)
    data = response.json()
    
    if data.get('success'):
        print(f"Title: {data['metadata']['title']}")
        print(f"Word Count: {data['metadata']['wordCount']}")
        print(f"Reading Time: {data['metadata']['readingTime']}")
        print(f"\nMarkdown Preview:\n{data['markdown']['content'][:200]}...")
        return data
    else:
        print(f"Error: {data.get('error')}")
        return None

# Usage
result = generate_content('Quantum Computing Basics')
```

### Node.js (TypeScript)

```typescript
interface GenerateContentRequest {
  topic: string;
  saveToFile?: boolean;
}

interface GenerateContentResponse {
  success: boolean;
  topic: string;
  markdown: {
    content: string;
    metadata: any;
    status: string;
  };
  html: {
    content: string;
    metadata: any;
    fileName: string;
    filePath: string | null;
    status: string;
  } | null;
  metadata: {
    title: string;
    slug: string;
    description: string;
    keywords: string[];
    publishedDate: string;
    wordCount: number;
    readingTime: string;
  };
  generatedAt: string;
}

async function generateContent(
  topic: string,
  saveToFile = false
): Promise<GenerateContentResponse> {
  const response = await fetch('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic, saveToFile }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Usage
const content = await generateContent('Cloud Native Architecture');
console.log(`Generated: ${content.metadata.title}`);
console.log(`Word count: ${content.metadata.wordCount}`);
console.log(`Keywords: ${content.metadata.keywords.join(', ')}`);
```

---

## Response Data Structure

### Markdown Object
- `content` (string): Full markdown formatted content
- `metadata` (object): Content metadata
- `status` (string): Publishing status

### HTML Object
- `content` (string): Complete HTML with embedded CSS
- `metadata` (object): Extended metadata with HTML-specific fields
- `fileName` (string): Suggested filename
- `filePath` (string | null): File path if saved to disk
- `status` (string): Publishing status

### Metadata Object
- `title` (string): Article title
- `slug` (string): URL-friendly slug
- `description` (string): SEO meta description
- `keywords` (array): SEO keywords
- `publishedDate` (string): ISO 8601 timestamp
- `wordCount` (number): Total word count
- `readingTime` (string): Estimated reading time

---

## Integration Examples

### React Component

```jsx
import React, { useState } from 'react';

function ContentGenerator() {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, saveToFile: false })
      });
      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div>
      <input 
        value={topic} 
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter topic"
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Content'}
      </button>
      
      {content && (
        <div>
          <h2>{content.metadata.title}</h2>
          <p>Reading time: {content.metadata.readingTime}</p>
          <div dangerouslySetInnerHTML={{ __html: content.html.content }} />
        </div>
      )}
    </div>
  );
}
```

### WordPress Integration

```php
<?php
function generate_ai_content($topic) {
    $url = 'http://localhost:3000/api/generate';
    $data = array(
        'topic' => $topic,
        'saveToFile' => false
    );
    
    $options = array(
        'http' => array(
            'header'  => "Content-type: application/json\r\n",
            'method'  => 'POST',
            'content' => json_encode($data)
        )
    );
    
    $context  = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    $response = json_decode($result, true);
    
    if ($response['success']) {
        // Create WordPress post
        $post_data = array(
            'post_title'    => $response['metadata']['title'],
            'post_content'  => $response['html']['content'],
            'post_status'   => 'draft',
            'post_excerpt'  => $response['metadata']['description'],
            'tags_input'    => $response['metadata']['keywords']
        );
        
        $post_id = wp_insert_post($post_data);
        return $post_id;
    }
    
    return false;
}
?>
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success - Content generated successfully |
| 400 | Bad Request - Missing or invalid topic |
| 500 | Internal Server Error - Generation failed |

---

## Rate Limiting

Currently, there are no rate limits. For production use, consider implementing:
- Rate limiting middleware (e.g., `express-rate-limit`)
- API key authentication
- Usage quotas per user/API key

---

## Best Practices

1. **Always validate the response**: Check `success` field before using data
2. **Handle errors gracefully**: Implement proper error handling
3. **Cache responses**: Cache generated content when appropriate
4. **Use webhooks**: For long-running requests, consider implementing webhooks
5. **Monitor usage**: Track API calls and generation times

---

## Performance

- **Average response time**: 10-30 seconds (depending on OpenAI API)
- **Typical output size**: 5-15 KB (JSON)
- **Concurrent requests**: Supported (each runs independently)

---

## Future Enhancements

- [ ] Batch generation endpoint
- [ ] Streaming responses with Server-Sent Events
- [ ] API key authentication
- [ ] Rate limiting
- [ ] Content templates/styles selection
- [ ] Custom word count targets
- [ ] Multi-language support
- [ ] Webhook notifications
- [ ] Content versioning

---

## Support

For issues or questions:
- Check server logs in the terminal
- Review the `UI_GUIDE.md` for WebSocket UI
- Check the `IMPLEMENTATION_SUMMARY.md` for architecture details

---

**Happy content generation! 🚀**
