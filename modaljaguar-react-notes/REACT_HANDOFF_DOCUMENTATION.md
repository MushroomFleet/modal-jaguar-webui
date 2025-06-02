# Jaguar Flux Modal API - React/Node.js Integration Guide

## Overview

This document provides comprehensive integration details for the Jaguar Flux Modal serverless API, a text-to-image generation service powered by the Shuttle-Jaguar model (8B parameters) running on Modal's infrastructure.

## Quick Start

### Base URL Structure
```
https://[YOUR_MODAL_USERNAME]--shuttle-jaguar-shuttlejaguarmodel-[ENDPOINT].modal.run
```

Replace `[YOUR_MODAL_USERNAME]` with your actual Modal deployment username.

### Example Base URL
```
https://mushroomfleet--shuttle-jaguar-shuttlejaguarmodel-generate-api.modal.run
```

## API Endpoints

### 1. Single Image Generation
**Endpoint:** `GET /generate_api`
**Full URL:** `https://[USERNAME]--shuttle-jaguar-shuttlejaguarmodel-generate-api.modal.run`

#### Parameters (Query String)
| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `prompt` | string | - | ✅ | Text description for image generation |
| `height` | integer | 1024 | ❌ | Image height in pixels (128-2048) |
| `width` | integer | 1024 | ❌ | Image width in pixels (128-2048) |
| `guidance_scale` | float | 3.5 | ❌ | Creativity control (1.0-20.0) |
| `steps` | integer | 4 | ❌ | Inference steps (1-50) |
| `max_seq_length` | integer | 256 | ❌ | Maximum prompt length |
| `seed` | integer | random | ❌ | Seed for reproducible results |

#### Response Format
```json
{
  "image": "base64_encoded_png_data",
  "parameters": {
    "prompt": "A cat holding a sign that says hello world",
    "height": 1024,
    "width": 1024,
    "guidance_scale": 3.5,
    "num_steps": 4,
    "max_seq_length": 256,
    "seed": 12345
  },
  "generation_time": 2.34
}
```

### 2. Batch Image Generation
**Endpoint:** `POST /batch_api`
**Full URL:** `https://[USERNAME]--shuttle-jaguar-shuttlejaguarmodel-batch-api.modal.run`

#### Request Body (JSON)
```json
{
  "prompts": ["prompt1", "prompt2", "prompt3"],
  "height": 1024,
  "width": 1024,
  "guidance_scale": 3.5,
  "steps": 4,
  "max_seq_length": 256,
  "base_seed": 42
}
```

#### Response Format
```json
{
  "results": [
    {
      "prompt": "prompt1",
      "image": "base64_encoded_png_data",
      "seed": 42,
      "generation_time": 2.1
    },
    {
      "prompt": "prompt2", 
      "image": "base64_encoded_png_data",
      "seed": 43,
      "generation_time": 1.9
    }
  ],
  "parameters": {
    "height": 1024,
    "width": 1024,
    "guidance_scale": 3.5,
    "num_steps": 4,
    "max_seq_length": 256,
    "base_seed": 42
  },
  "total_generation_time": 4.2,
  "images_generated": 2
}
```

### 3. Model Information
**Endpoint:** `GET /info`
**Full URL:** `https://[USERNAME]--shuttle-jaguar-shuttlejaguarmodel-info.modal.run`

#### Response Format
```json
{
  "model": "shuttleai/shuttle-jaguar",
  "version": "bfloat16",
  "parameters": "8B",
  "format": "diffusers",
  "source": "volume",
  "capabilities": ["text-to-image"],
  "recommended_settings": {
    "height": 1024,
    "width": 1024,
    "guidance_scale": 3.5,
    "num_steps": 4,
    "max_seq_length": 256
  },
  "volume_path": "/vol/models/shuttle-jaguar"
}
```

### 4. Force Model Reload
**Endpoint:** `POST /reload_model`
**Full URL:** `https://[USERNAME]--shuttle-jaguar-shuttlejaguarmodel-reload-model.modal.run`

⚠️ **Advanced Use Only** - Forces model reload from HuggingFace

## React Integration Examples

### Basic React Hook for Single Image Generation

```jsx
import { useState, useCallback } from 'react';

const useJaguarImageGeneration = (baseUrl) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const generateImage = useCallback(async (options = {}) => {
    const {
      prompt,
      height = 1024,
      width = 1024,
      guidance_scale = 3.5,
      steps = 4,
      max_seq_length = 256,
      seed
    } = options;

    if (!prompt) {
      setError('Prompt is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = new URL(`${baseUrl}-shuttlejaguarmodel-generate-api.modal.run`);
      const params = {
        prompt,
        height: height.toString(),
        width: width.toString(),
        guidance_scale: guidance_scale.toString(),
        steps: steps.toString(),
        max_seq_length: max_seq_length.toString()
      };

      if (seed) {
        params.seed = seed.toString();
      }

      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  return { generateImage, loading, error, result };
};
```

### React Component Example

```jsx
import React, { useState } from 'react';
import { useJaguarImageGeneration } from './hooks/useJaguarImageGeneration';

const ImageGenerator = ({ apiBaseUrl }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const { generateImage, loading, error } = useJaguarImageGeneration(apiBaseUrl);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await generateImage({
        prompt,
        width: 768,
        height: 768,
        guidance_scale: 4.0,
        steps: 6
      });
      
      setGeneratedImage(`data:image/png;base64,${result.image}`);
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  return (
    <div className="image-generator">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="prompt">Prompt:</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            rows={3}
            required
          />
        </div>
        
        <button type="submit" disabled={loading || !prompt.trim()}>
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </form>

      {error && (
        <div className="error">
          Error: {error}
        </div>
      )}

      {generatedImage && (
        <div className="result">
          <h3>Generated Image</h3>
          <img 
            src={generatedImage} 
            alt="Generated artwork"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
```

### Batch Generation Hook

```jsx
import { useState, useCallback } from 'react';

const useBatchImageGeneration = (baseUrl) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);

  const generateBatch = useCallback(async (prompts, options = {}) => {
    const {
      height = 1024,
      width = 1024,
      guidance_scale = 3.5,
      steps = 4,
      max_seq_length = 256,
      base_seed
    } = options;

    setLoading(true);
    setError(null);
    setResults([]);
    setProgress(0);

    try {
      const url = `${baseUrl}-shuttlejaguarmodel-batch-api.modal.run`;
      
      const requestBody = {
        prompts,
        height,
        width,
        guidance_scale,
        steps,
        max_seq_length
      };

      if (base_seed) {
        requestBody.base_seed = base_seed;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.results);
      setProgress(100);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  return { generateBatch, loading, error, results, progress };
};
```

## Node.js Integration Examples

### Basic Node.js Implementation

```javascript
const fetch = require('node-fetch');

class JaguarFluxAPI {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async generateImage(options = {}) {
    const {
      prompt,
      height = 1024,
      width = 1024,
      guidance_scale = 3.5,
      steps = 4,
      max_seq_length = 256,
      seed
    } = options;

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const url = new URL(`${this.baseUrl}-shuttlejaguarmodel-generate-api.modal.run`);
    const params = {
      prompt,
      height: height.toString(),
      width: width.toString(),
      guidance_scale: guidance_scale.toString(),
      steps: steps.toString(),
      max_seq_length: max_seq_length.toString()
    };

    if (seed) {
      params.seed = seed.toString();
    }

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async generateBatch(prompts, options = {}) {
    const {
      height = 1024,
      width = 1024,
      guidance_scale = 3.5,
      steps = 4,
      max_seq_length = 256,
      base_seed
    } = options;

    const url = `${this.baseUrl}-shuttlejaguarmodel-batch-api.modal.run`;
    
    const requestBody = {
      prompts,
      height,
      width,
      guidance_scale,
      steps,
      max_seq_length
    };

    if (base_seed) {
      requestBody.base_seed = base_seed;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getModelInfo() {
    const url = `${this.baseUrl}-shuttlejaguarmodel-info.modal.run`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Usage example
const api = new JaguarFluxAPI('https://your-username--shuttle-jaguar');

async function example() {
  try {
    // Generate single image
    const result = await api.generateImage({
      prompt: 'A futuristic cityscape at sunset',
      width: 768,
      height: 768
    });
    
    console.log('Generation time:', result.generation_time);
    // result.image contains base64 PNG data
    
    // Generate batch
    const batchResult = await api.generateBatch([
      'A red sports car',
      'A blue mountain landscape',
      'A green forest scene'
    ]);
    
    console.log('Total time:', batchResult.total_generation_time);
    console.log('Images generated:', batchResult.images_generated);
    
  } catch (error) {
    console.error('API Error:', error.message);
  }
}
```

### Express.js API Wrapper

```javascript
const express = require('express');
const { JaguarFluxAPI } = require('./jaguar-api');

const app = express();
app.use(express.json());

const jaguarAPI = new JaguarFluxAPI(process.env.JAGUAR_BASE_URL);

// Single image generation endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, ...options } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await jaguarAPI.generateImage({ prompt, ...options });
    res.json(result);
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Batch generation endpoint
app.post('/api/generate-batch', async (req, res) => {
  try {
    const { prompts, ...options } = req.body;
    
    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({ error: 'Prompts array is required' });
    }

    const result = await jaguarAPI.generateBatch(prompts, options);
    res.json(result);
  } catch (error) {
    console.error('Batch generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Model info endpoint
app.get('/api/model-info', async (req, res) => {
  try {
    const info = await jaguarAPI.getModelInfo();
    res.json(info);
  } catch (error) {
    console.error('Model info error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Performance Considerations

### Model Loading States
- **First Run**: ~2-3 minutes (downloads model from HuggingFace)
- **Subsequent Runs**: ~10-20 seconds (loads from Modal Volume)
- **Cold Start**: May take 30-60 seconds if container needs initialization

### Optimization Tips

1. **Image Dimensions**: Smaller images generate faster
   - 512x512: ~1-2 seconds
   - 1024x1024: ~2-4 seconds
   - 2048x2048: ~8-12 seconds

2. **Inference Steps**: Fewer steps = faster generation
   - 2-4 steps: Good for quick previews
   - 6-8 steps: Balanced quality/speed
   - 12+ steps: High quality but slower

3. **Batch Processing**: More efficient for multiple images
   - Use batch endpoint for >3 images
   - Maximum recommended batch size: 10 images

4. **Caching Strategy**: Cache frequently used generated images
   ```javascript
   const imageCache = new Map();
   
   function getCacheKey(options) {
     return JSON.stringify(options);
   }
   
   async function generateWithCache(options) {
     const key = getCacheKey(options);
     
     if (imageCache.has(key)) {
       return imageCache.get(key);
     }
     
     const result = await api.generateImage(options);
     imageCache.set(key, result);
     return result;
   }
   ```

## Error Handling

### Common HTTP Status Codes
- **200**: Success
- **400**: Bad Request (invalid parameters)
- **404**: Endpoint not found (check URL structure)
- **500**: Server Error (model loading issues)
- **503**: Service Unavailable (cold start or resource limits)

### Error Response Format
```json
{
  "error": "Error message description"
}
```

### Recommended Error Handling Pattern

```javascript
async function handleAPICall(apiFunction, ...args) {
  try {
    return await apiFunction(...args);
  } catch (error) {
    if (error.message.includes('503')) {
      // Retry after cold start
      await new Promise(resolve => setTimeout(resolve, 5000));
      return await apiFunction(...args);
    }
    
    if (error.message.includes('400')) {
      throw new Error('Invalid parameters provided');
    }
    
    if (error.message.includes('500')) {
      throw new Error('Model loading error - try again in a few minutes');
    }
    
    throw error;
  }
}
```

## Environment Configuration

### Environment Variables

```bash
# Required
JAGUAR_BASE_URL=https://your-username--shuttle-jaguar

# Optional
JAGUAR_DEFAULT_WIDTH=1024
JAGUAR_DEFAULT_HEIGHT=1024
JAGUAR_DEFAULT_STEPS=4
JAGUAR_DEFAULT_GUIDANCE=3.5
```

### React Environment Setup

```javascript
// .env.local
REACT_APP_JAGUAR_BASE_URL=https://your-username--shuttle-jaguar
```

```javascript
// config.js
export const API_CONFIG = {
  baseUrl: process.env.REACT_APP_JAGUAR_BASE_URL,
  defaults: {
    width: 1024,
    height: 1024,
    guidance_scale: 3.5,
    steps: 4,
    max_seq_length: 256
  }
};
```

## CORS Considerations

Modal endpoints automatically handle CORS for web requests. No additional configuration needed.

## Rate Limiting

Modal handles auto-scaling, but consider:
- Implement client-side rate limiting for UX
- Use loading states for long operations
- Queue multiple requests appropriately

```javascript
class RequestQueue {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  async add(requestFunction) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFunction, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { requestFunction, resolve, reject } = this.queue.shift();

    try {
      const result = await requestFunction();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}
```

## Testing & Development

### Test URLs
Use the model info endpoint to verify your deployment:
```bash
curl "https://your-username--shuttle-jaguar-shuttlejaguarmodel-info.modal.run"
```

### Mock API for Development
```javascript
// mockAPI.js
export const createMockAPI = () => ({
  generateImage: async (options) => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
    return {
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1vY2sgSW1hZ2U8L3RleHQ+PC9zdmc+",
      parameters: options,
      generation_time: 2.1
    };
  }
});
```

## Support & Troubleshooting

### Check Model Status
Always verify the model source (volume vs HuggingFace) using the info endpoint:

```javascript
const checkModelStatus = async () => {
  const info = await api.getModelInfo();
  
  if (info.source === 'volume') {
    console.log('✅ Model loading from volume (fast startup)');
  } else {
    console.log('⚠️ Model loading from HuggingFace (slower first run)');
  }
  
  return info;
};
```

### Debugging Tips
1. Always check the info endpoint first
2. Monitor generation times to detect cold starts
3. Implement retry logic for 503 errors
4. Log all API interactions for debugging

For additional troubleshooting, refer to the [TROUBLESHOOTING.md](jaguar-modal/TROUBLESHOOTING.md) file in the repository.

---

## Quick Reference

### Default Parameters
```javascript
const defaults = {
  height: 1024,
  width: 1024,
  guidance_scale: 3.5,
  steps: 4,
  max_seq_length: 256
  // seed: random
};
```

### Endpoint URLs
```
GET  /generate_api  - Single image generation
POST /batch_api     - Batch generation  
GET  /info         - Model information
POST /reload_model  - Force model reload
```

### Base64 Image Usage
```html
<img src="data:image/png;base64,{result.image}" alt="Generated image" />
```

This completes the integration guide. Your React/Node.js team should have everything needed to integrate with the Jaguar Flux Modal API!
