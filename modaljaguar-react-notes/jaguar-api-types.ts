// TypeScript definitions for Jaguar Flux Modal API

export interface ImageGenerationOptions {
  prompt: string;
  height?: number;
  width?: number;
  guidance_scale?: number;
  steps?: number;
  max_seq_length?: number;
  seed?: number;
}

export interface ImageGenerationResponse {
  image: string; // base64 encoded PNG
  parameters: {
    prompt: string;
    height: number;
    width: number;
    guidance_scale: number;
    num_steps: number;
    max_seq_length: number;
    seed: number | null;
  };
  generation_time: number;
}

export interface BatchGenerationOptions {
  prompts: string[];
  height?: number;
  width?: number;
  guidance_scale?: number;
  steps?: number;
  max_seq_length?: number;
  base_seed?: number;
}

export interface BatchImageResult {
  prompt: string;
  image: string; // base64 encoded PNG
  seed: number;
  generation_time: number;
}

export interface BatchGenerationResponse {
  results: BatchImageResult[];
  parameters: {
    height: number;
    width: number;
    guidance_scale: number;
    num_steps: number;
    max_seq_length: number;
    base_seed: number | null;
  };
  total_generation_time: number;
  images_generated: number;
}

export interface ModelInfo {
  model: string;
  version: string;
  parameters: string;
  format: string;
  source: 'volume' | 'huggingface';
  capabilities: string[];
  recommended_settings: {
    height: number;
    width: number;
    guidance_scale: number;
    num_steps: number;
    max_seq_length: number;
  };
  volume_path: string;
}

export interface ModelReloadResponse {
  success: boolean;
  message: string;
  model_path?: string;
}

export interface APIError {
  error: string;
}

// Hook return types
export interface UseImageGenerationReturn {
  generateImage: (options: ImageGenerationOptions) => Promise<ImageGenerationResponse>;
  loading: boolean;
  error: string | null;
  result: ImageGenerationResponse | null;
}

export interface UseBatchGenerationReturn {
  generateBatch: (prompts: string[], options?: Omit<BatchGenerationOptions, 'prompts'>) => Promise<BatchGenerationResponse>;
  loading: boolean;
  error: string | null;
  results: BatchImageResult[];
  progress: number;
}

// API Class interface
export interface IJaguarFluxAPI {
  generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResponse>;
  generateBatch(prompts: string[], options?: Omit<BatchGenerationOptions, 'prompts'>): Promise<BatchGenerationResponse>;
  getModelInfo(): Promise<ModelInfo>;
  reloadModel?(): Promise<ModelReloadResponse>;
}

// Configuration interfaces
export interface APIConfig {
  baseUrl: string;
  defaults: {
    width: number;
    height: number;
    guidance_scale: number;
    steps: number;
    max_seq_length: number;
  };
}

// React component prop types
export interface ImageGeneratorProps {
  apiBaseUrl: string;
  defaultOptions?: Partial<ImageGenerationOptions>;
  onImageGenerated?: (result: ImageGenerationResponse) => void;
  onError?: (error: string) => void;
}

export interface BatchGeneratorProps {
  apiBaseUrl: string;
  defaultOptions?: Partial<BatchGenerationOptions>;
  onBatchCompleted?: (results: BatchGenerationResponse) => void;
  onError?: (error: string) => void;
}

// Utility types
export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface GenerationState {
  status: GenerationStatus;
  result?: ImageGenerationResponse;
  error?: string;
  progress?: number;
}

// Request queue types
export interface QueuedRequest<T = any> {
  requestFunction: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

export interface RequestQueueOptions {
  maxConcurrent?: number;
  timeout?: number;
  retryAttempts?: number;
}

// Cache types
export interface CacheEntry {
  result: ImageGenerationResponse;
  timestamp: number;
  accessCount: number;
}

export interface CacheOptions {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
  strategy?: 'lru' | 'lfu'; // Least Recently Used or Least Frequently Used
}

// Error handling
export class JaguarAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'JaguarAPIError';
  }
}

// Constants
export const API_ENDPOINTS = {
  GENERATE: 'shuttlejaguarmodel-generate-api',
  BATCH: 'shuttlejaguarmodel-batch-api',
  INFO: 'shuttlejaguarmodel-info',
  RELOAD: 'shuttlejaguarmodel-reload-model'
} as const;

export const DEFAULT_OPTIONS: Required<Omit<ImageGenerationOptions, 'prompt'>> = {
  height: 1024,
  width: 1024,
  guidance_scale: 3.5,
  steps: 4,
  max_seq_length: 256,
  seed: Math.floor(Math.random() * 1000000)
};

export const PARAMETER_LIMITS = {
  height: { min: 128, max: 2048 },
  width: { min: 128, max: 2048 },
  guidance_scale: { min: 1.0, max: 20.0 },
  steps: { min: 1, max: 50 },
  max_seq_length: { min: 1, max: 512 },
  batch_size: { min: 1, max: 10 }
} as const;

// Validation functions
export function validateGenerationOptions(options: ImageGenerationOptions): string[] {
  const errors: string[] = [];
  
  if (!options.prompt || options.prompt.trim().length === 0) {
    errors.push('Prompt is required and cannot be empty');
  }
  
  if (options.height && (options.height < PARAMETER_LIMITS.height.min || options.height > PARAMETER_LIMITS.height.max)) {
    errors.push(`Height must be between ${PARAMETER_LIMITS.height.min} and ${PARAMETER_LIMITS.height.max}`);
  }
  
  if (options.width && (options.width < PARAMETER_LIMITS.width.min || options.width > PARAMETER_LIMITS.width.max)) {
    errors.push(`Width must be between ${PARAMETER_LIMITS.width.min} and ${PARAMETER_LIMITS.width.max}`);
  }
  
  if (options.guidance_scale && (options.guidance_scale < PARAMETER_LIMITS.guidance_scale.min || options.guidance_scale > PARAMETER_LIMITS.guidance_scale.max)) {
    errors.push(`Guidance scale must be between ${PARAMETER_LIMITS.guidance_scale.min} and ${PARAMETER_LIMITS.guidance_scale.max}`);
  }
  
  if (options.steps && (options.steps < PARAMETER_LIMITS.steps.min || options.steps > PARAMETER_LIMITS.steps.max)) {
    errors.push(`Steps must be between ${PARAMETER_LIMITS.steps.min} and ${PARAMETER_LIMITS.steps.max}`);
  }
  
  if (options.max_seq_length && (options.max_seq_length < PARAMETER_LIMITS.max_seq_length.min || options.max_seq_length > PARAMETER_LIMITS.max_seq_length.max)) {
    errors.push(`Max sequence length must be between ${PARAMETER_LIMITS.max_seq_length.min} and ${PARAMETER_LIMITS.max_seq_length.max}`);
  }
  
  return errors;
}

export function validateBatchOptions(options: BatchGenerationOptions): string[] {
  const errors: string[] = [];
  
  if (!options.prompts || !Array.isArray(options.prompts) || options.prompts.length === 0) {
    errors.push('Prompts array is required and cannot be empty');
  } else {
    if (options.prompts.length > PARAMETER_LIMITS.batch_size.max) {
      errors.push(`Batch size cannot exceed ${PARAMETER_LIMITS.batch_size.max} prompts`);
    }
    
    const emptyPrompts = options.prompts.filter(p => !p || p.trim().length === 0);
    if (emptyPrompts.length > 0) {
      errors.push('All prompts must be non-empty strings');
    }
  }
  
  // Validate other options using the same logic as single generation
  const singleOptions: ImageGenerationOptions = {
    prompt: 'dummy', // We already validated prompts above
    ...options
  };
  delete (singleOptions as any).prompts;
  
  const singleErrors = validateGenerationOptions(singleOptions);
  errors.push(...singleErrors.filter(e => e !== 'Prompt is required and cannot be empty'));
  
  return errors;
}

// Utility type for creating URL with parameters
export function buildApiUrl(baseUrl: string, endpoint: keyof typeof API_ENDPOINTS, params?: Record<string, string>): string {
  const url = new URL(`${baseUrl}-${API_ENDPOINTS[endpoint]}.modal.run`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  return url.toString();
}

// Type guard functions
export function isImageGenerationResponse(obj: any): obj is ImageGenerationResponse {
  return obj && 
    typeof obj.image === 'string' && 
    obj.parameters && 
    typeof obj.generation_time === 'number';
}

export function isBatchGenerationResponse(obj: any): obj is BatchGenerationResponse {
  return obj && 
    Array.isArray(obj.results) && 
    obj.parameters && 
    typeof obj.total_generation_time === 'number' &&
    typeof obj.images_generated === 'number';
}

export function isModelInfo(obj: any): obj is ModelInfo {
  return obj && 
    typeof obj.model === 'string' && 
    typeof obj.version === 'string' && 
    typeof obj.source === 'string' &&
    Array.isArray(obj.capabilities);
}

export function isAPIError(obj: any): obj is APIError {
  return obj && typeof obj.error === 'string';
}
