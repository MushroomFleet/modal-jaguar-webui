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
  
  return errors;
}
