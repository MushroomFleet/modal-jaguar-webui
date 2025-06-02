# Jaguar Flux Modal API - Quick Start Guide

## 🚀 For React/Node.js Developers

This quick start guide helps you integrate the Jaguar Flux Modal API into your React or Node.js applications in minutes.

## Prerequisites

- Your Modal deployment URL (format: `https://[username]--shuttle-jaguar`)
- Node.js 14+ (for Node.js examples)
- React 16.8+ (for React examples)

## 1. Get Your API URL

After deploying with Modal, you'll receive a base URL like:
```
https://mushroomfleet--shuttle-jaguar
```

## 2. Quick Test

Test your deployment is working:
```bash
curl "https://[YOUR_URL]--shuttle-jaguar-shuttlejaguarmodel-info.modal.run"
```

You should see model information in the response.

## 3. Choose Your Integration

### Option A: React Component (TypeScript)

1. Copy the TypeScript types:
   ```bash
   cp jaguar-api-types.ts src/types/
   ```

2. Use the React component:
   ```jsx
   import { JaguarImageGenerator } from './components/JaguarImageGenerator';
   
   function App() {
     return (
       <JaguarImageGenerator 
         apiBaseUrl="https://your-username--shuttle-jaguar"
         onImageGenerated={(result) => console.log('Generated!', result)}
       />
     );
   }
   ```

### Option B: Node.js/JavaScript

1. Copy the JavaScript client:
   ```bash
   cp node-examples/JaguarFluxAPI.js src/
   ```

2. Use in your Node.js app:
   ```javascript
   const { JaguarFluxAPI } = require('./JaguarFluxAPI');
   
   const api = new JaguarFluxAPI('https://your-username--shuttle-jaguar');
   
   async function generateImage() {
     const result = await api.generateImage({
       prompt: 'A beautiful sunset over mountains',
       width: 768,
       height: 768
     });
     
     console.log('Generation time:', result.generation_time);
     return result.image; // Base64 PNG data
   }
   ```

### Option C: Browser JavaScript (Vanilla)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Jaguar Flux Demo</title>
</head>
<body>
    <script src="JaguarFluxAPI.js"></script>
    <script>
        const api = new JaguarFluxAPI('https://your-username--shuttle-jaguar');
        
        async function generate() {
            const result = await api.generateImage({
                prompt: document.getElementById('prompt').value
            });
            
            document.getElementById('result').src = 
                JaguarFluxAPI.createImageUrl(result.image);
        }
    </script>
    
    <input type="text" id="prompt" placeholder="Enter your prompt...">
    <button onclick="generate()">Generate</button>
    <img id="result" style="max-width: 100%;">
</body>
</html>
```

## 4. API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/generate_api` | GET | Single image generation |
| `/batch_api` | POST | Batch image generation |
| `/info` | GET | Model information |
| `/reload_model` | POST | Force model reload |

## 5. Essential Parameters

### Single Image Generation
```javascript
{
  prompt: "Your text prompt",        // Required
  width: 1024,                      // Optional, default: 1024
  height: 1024,                     // Optional, default: 1024
  guidance_scale: 3.5,              // Optional, default: 3.5
  steps: 4,                         // Optional, default: 4
  seed: 12345                       // Optional, for reproducibility
}
```

### Response Format
```javascript
{
  image: "base64_encoded_png_data",
  parameters: { /* generation parameters */ },
  generation_time: 2.34
}
```

## 6. Error Handling

```javascript
try {
  const result = await api.generateImage(options);
  // Success
} catch (error) {
  if (error.statusCode === 503) {
    // Cold start - retry after a few seconds
    console.log('Service starting up, please wait...');
  } else if (error.statusCode === 400) {
    // Invalid parameters
    console.log('Check your parameters:', error.message);
  } else {
    // Other error
    console.log('API Error:', error.message);
  }
}
```

## 7. Performance Tips

### Optimize for Speed
```javascript
// Faster generation (lower quality)
const quickOptions = {
  prompt: "your prompt",
  width: 512,      // Smaller dimensions
  height: 512,
  steps: 2,        // Fewer steps
  guidance_scale: 2.5
};

// Higher quality (slower)
const qualityOptions = {
  prompt: "your prompt",
  width: 1024,
  height: 1024,
  steps: 8,        // More steps
  guidance_scale: 4.5
};
```

### Batch Processing
```javascript
// More efficient for multiple images
const prompts = [
  "A red rose",
  "A blue sky", 
  "A green field"
];

const batchResult = await api.generateBatch(prompts, {
  width: 512,
  height: 512
});

// Access individual results
batchResult.results.forEach((result, index) => {
  console.log(`Image ${index + 1}:`, result.prompt);
  // result.image contains the base64 data
});
```

## 8. Environment Configuration

### React (.env.local)
```bash
REACT_APP_JAGUAR_BASE_URL=https://your-username--shuttle-jaguar
```

### Node.js (.env)
```bash
JAGUAR_BASE_URL=https://your-username--shuttle-jaguar
JAGUAR_TIMEOUT=30000
JAGUAR_RETRY_ATTEMPTS=2
```

## 9. Production Considerations

### Add Request Queue
```javascript
const queue = new RequestQueue(3); // Max 3 concurrent requests

const result = await queue.add(() => 
  api.generateImage({ prompt: "Queued generation" })
);
```

### Add Caching
```javascript
const cache = new ImageCache({ maxSize: 100, ttl: 3600000 });

async function generateWithCache(options) {
  const key = cache.createKey(options);
  let result = cache.get(key);
  
  if (!result) {
    result = await api.generateImage(options);
    cache.set(key, result);
  }
  
  return result;
}
```

## 10. Model Status Check

Always check if the model is loading from volume for optimal performance:

```javascript
const info = await api.getModelInfo();

if (info.source === 'volume') {
  console.log('✅ Fast startup - loading from volume');
} else {
  console.log('⚠️ First run - downloading from HuggingFace (~2-3 minutes)');
}
```

## Next Steps

1. **Read the full documentation**: [REACT_HANDOFF_DOCUMENTATION.md](REACT_HANDOFF_DOCUMENTATION.md)
2. **Explore the TypeScript types**: [jaguar-api-types.ts](jaguar-api-types.ts)
3. **Review React examples**: [react-examples/JaguarImageGenerator.tsx](react-examples/JaguarImageGenerator.tsx)
4. **Check Node.js implementation**: [node-examples/JaguarFluxAPI.js](node-examples/JaguarFluxAPI.js)
5. **Test with the web demo**: [jaguar-modal/web_demo.html](jaguar-modal/web_demo.html)

## Support

- Check model loading status with `/info` endpoint
- Monitor generation times to detect cold starts
- Implement retry logic for 503 errors
- Refer to [TROUBLESHOOTING.md](jaguar-modal/TROUBLESHOOTING.md) for common issues

---

**🎉 You're ready to generate amazing images with the Jaguar Flux Modal API!**
