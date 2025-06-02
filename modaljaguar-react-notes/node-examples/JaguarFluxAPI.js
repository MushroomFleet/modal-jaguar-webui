/**
 * Jaguar Flux Modal API Client
 * A comprehensive JavaScript client for the Jaguar Flux image generation API
 */

class JaguarFluxAPI {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl;
    this.defaults = {
      height: 1024,
      width: 1024,
      guidance_scale: 3.5,
      steps: 4,
      max_seq_length: 256,
      ...options.defaults
    };
    this.timeout = options.timeout || 30000;
    this.retryAttempts = options.retryAttempts || 1;
  }

  /**
   * Generate a single image
   * @param {Object} options - Generation options
   * @param {string} options.prompt - Text prompt for image generation
   * @param {number} [options.height] - Image height in pixels
   * @param {number} [options.width] - Image width in pixels
   * @param {number} [options.guidance_scale] - Guidance scale (1.0-20.0)
   * @param {number} [options.steps] - Number of inference steps
   * @param {number} [options.max_seq_length] - Maximum sequence length
   * @param {number} [options.seed] - Seed for reproducible results
   * @returns {Promise<Object>} Generation result
   */
  async generateImage(options = {}) {
    this.validateGenerationOptions(options);
    
    const params = {
      prompt: options.prompt,
      height: (options.height || this.defaults.height).toString(),
      width: (options.width || this.defaults.width).toString(),
      guidance_scale: (options.guidance_scale || this.defaults.guidance_scale).toString(),
      steps: (options.steps || this.defaults.steps).toString(),
      max_seq_length: (options.max_seq_length || this.defaults.max_seq_length).toString()
    };

    if (options.seed !== undefined) {
      params.seed = options.seed.toString();
    }

    const url = new URL(`${this.baseUrl}-shuttlejaguarmodel-generate-api.modal.run`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    return this.makeRequest(url, { method: 'GET' });
  }

  /**
   * Generate multiple images in batch
   * @param {string[]} prompts - Array of text prompts
   * @param {Object} [options] - Generation options
   * @returns {Promise<Object>} Batch generation result
   */
  async generateBatch(prompts, options = {}) {
    this.validateBatchOptions({ prompts, ...options });

    const requestBody = {
      prompts,
      height: options.height || this.defaults.height,
      width: options.width || this.defaults.width,
      guidance_scale: options.guidance_scale || this.defaults.guidance_scale,
      steps: options.steps || this.defaults.steps,
      max_seq_length: options.max_seq_length || this.defaults.max_seq_length
    };

    if (options.base_seed !== undefined) {
      requestBody.base_seed = options.base_seed;
    }

    const url = `${this.baseUrl}-shuttlejaguarmodel-batch-api.modal.run`;
    
    return this.makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
  }

  /**
   * Get model information
   * @returns {Promise<Object>} Model information
   */
  async getModelInfo() {
    const url = `${this.baseUrl}-shuttlejaguarmodel-info.modal.run`;
    return this.makeRequest(url, { method: 'GET' });
  }

  /**
   * Force reload model from HuggingFace
   * @returns {Promise<Object>} Reload result
   */
  async reloadModel() {
    const url = `${this.baseUrl}-shuttlejaguarmodel-reload-model.modal.run`;
    return this.makeRequest(url, { method: 'POST' });
  }

  /**
   * Make HTTP request with retry logic
   * @private
   */
  async makeRequest(url, options) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Handle specific HTTP errors
          if (response.status === 503 && attempt < this.retryAttempts) {
            // Service unavailable - likely cold start, retry after delay
            await this.delay(5000);
            continue;
          }

          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // If we can't parse error JSON, use the generic message
          }

          throw new JaguarAPIError(errorMessage, response.status);
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        
        if (error.name === 'AbortError') {
          throw new JaguarAPIError('Request timeout', 408);
        }

        if (attempt < this.retryAttempts) {
          await this.delay(1000 * (attempt + 1)); // Exponential backoff
          continue;
        }
      }
    }

    throw lastError;
  }

  /**
   * Validate generation options
   * @private
   */
  validateGenerationOptions(options) {
    const errors = [];

    if (!options.prompt || options.prompt.trim().length === 0) {
      errors.push('Prompt is required and cannot be empty');
    }

    if (options.height && (options.height < 128 || options.height > 2048)) {
      errors.push('Height must be between 128 and 2048');
    }

    if (options.width && (options.width < 128 || options.width > 2048)) {
      errors.push('Width must be between 128 and 2048');
    }

    if (options.guidance_scale && (options.guidance_scale < 1.0 || options.guidance_scale > 20.0)) {
      errors.push('Guidance scale must be between 1.0 and 20.0');
    }

    if (options.steps && (options.steps < 1 || options.steps > 50)) {
      errors.push('Steps must be between 1 and 50');
    }

    if (errors.length > 0) {
      throw new JaguarAPIError(`Validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Validate batch options
   * @private
   */
  validateBatchOptions(options) {
    const errors = [];

    if (!options.prompts || !Array.isArray(options.prompts) || options.prompts.length === 0) {
      errors.push('Prompts array is required and cannot be empty');
    } else {
      if (options.prompts.length > 10) {
        errors.push('Batch size cannot exceed 10 prompts');
      }

      const emptyPrompts = options.prompts.filter(p => !p || p.trim().length === 0);
      if (emptyPrompts.length > 0) {
        errors.push('All prompts must be non-empty strings');
      }
    }

    // Validate other options
    this.validateGenerationOptions({ prompt: 'dummy', ...options });

    if (errors.length > 0) {
      throw new JaguarAPIError(`Validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Utility delay function
   * @private
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create image URL from base64 data
   * @param {string} base64Data - Base64 encoded image data
   * @returns {string} Data URL for the image
   */
  static createImageUrl(base64Data) {
    return `data:image/png;base64,${base64Data}`;
  }

  /**
   * Download image from base64 data
   * @param {string} base64Data - Base64 encoded image data
   * @param {string} [filename] - Optional filename
   */
  static downloadImage(base64Data, filename = `jaguar-${Date.now()}.png`) {
    if (typeof document === 'undefined') {
      throw new Error('Download functionality is only available in browser environment');
    }

    const link = document.createElement('a');
    link.href = this.createImageUrl(base64Data);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Save image to file (Node.js only)
   * @param {string} base64Data - Base64 encoded image data
   * @param {string} filepath - File path to save to
   */
  static async saveImageToFile(base64Data, filepath) {
    if (typeof require === 'undefined') {
      throw new Error('File saving is only available in Node.js environment');
    }

    const fs = require('fs').promises;
    const buffer = Buffer.from(base64Data, 'base64');
    await fs.writeFile(filepath, buffer);
  }
}

/**
 * Custom error class for Jaguar API errors
 */
class JaguarAPIError extends Error {
  constructor(message, statusCode = null, response = null) {
    super(message);
    this.name = 'JaguarAPIError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

/**
 * Request queue for managing concurrent requests
 */
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

/**
 * Image cache for storing generated images
 */
class ImageCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100;
    this.ttl = options.ttl || 3600000; // 1 hour default
    this.cache = new Map();
  }

  set(key, value) {
    const entry = {
      value,
      timestamp: Date.now(),
      accessCount: 1
    };
    
    this.cache.set(key, entry);
    this.cleanup();
  }

  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    entry.accessCount++;
    return entry.value;
  }

  createKey(options) {
    return JSON.stringify(options);
  }

  cleanup() {
    if (this.cache.size <= this.maxSize) {
      return;
    }

    // Remove oldest entries
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, this.cache.size - this.maxSize);
    toRemove.forEach(([key]) => this.cache.delete(key));
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js
  module.exports = {
    JaguarFluxAPI,
    JaguarAPIError,
    RequestQueue,
    ImageCache
  };
} else if (typeof window !== 'undefined') {
  // Browser
  window.JaguarFluxAPI = JaguarFluxAPI;
  window.JaguarAPIError = JaguarAPIError;
  window.RequestQueue = RequestQueue;
  window.ImageCache = ImageCache;
}

// Usage examples:

/*
// Basic usage
const api = new JaguarFluxAPI('https://your-username--shuttle-jaguar');

// Generate single image
const result = await api.generateImage({
  prompt: 'A beautiful sunset over mountains',
  width: 768,
  height: 768
});

// Use the image
const imageUrl = JaguarFluxAPI.createImageUrl(result.image);
document.getElementById('myImage').src = imageUrl;

// Generate batch
const batchResult = await api.generateBatch([
  'A red sports car',
  'A blue ocean',
  'A green forest'
], {
  width: 512,
  height: 512,
  guidance_scale: 4.0
});

// With request queue
const queue = new RequestQueue(2); // Max 2 concurrent requests

const queuedResult = await queue.add(() => 
  api.generateImage({ prompt: 'Queued generation' })
);

// With caching
const cache = new ImageCache({ maxSize: 50 });
const cacheKey = cache.createKey({ prompt: 'Cached prompt' });

let cachedResult = cache.get(cacheKey);
if (!cachedResult) {
  cachedResult = await api.generateImage({ prompt: 'Cached prompt' });
  cache.set(cacheKey, cachedResult);
}
*/
