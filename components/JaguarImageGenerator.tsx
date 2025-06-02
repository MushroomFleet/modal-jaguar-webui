'use client';

import React, { useState, useCallback } from 'react';
import { 
  ImageGenerationOptions, 
  ImageGenerationResponse, 
  validateGenerationOptions,
  DEFAULT_OPTIONS 
} from '../types/jaguar-api';

interface JaguarImageGeneratorProps {
  apiBaseUrl: string;
  onImageGenerated?: (result: ImageGenerationResponse) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const JaguarImageGenerator: React.FC<JaguarImageGeneratorProps> = ({
  apiBaseUrl,
  onImageGenerated,
  onError,
  className = ''
}) => {
  // Form state
  const [prompt, setPrompt] = useState('');
  const [height, setHeight] = useState(DEFAULT_OPTIONS.height);
  const [width, setWidth] = useState(DEFAULT_OPTIONS.width);
  const [guidanceScale, setGuidanceScale] = useState(DEFAULT_OPTIONS.guidance_scale);
  const [steps, setSteps] = useState(DEFAULT_OPTIONS.steps);
  const [seed, setSeed] = useState<number | ''>('');
  
  // Generation state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageGenerationResponse | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const generateImage = useCallback(async (options: ImageGenerationOptions) => {
    setLoading(true);
    setError(null);

    try {
      // Validate options
      const validationErrors = validateGenerationOptions(options);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const url = new URL(`${apiBaseUrl}-shuttlejaguarmodel-generate-api.modal.run`);
      const params: Record<string, string> = {
        prompt: options.prompt,
        height: options.height?.toString() || DEFAULT_OPTIONS.height.toString(),
        width: options.width?.toString() || DEFAULT_OPTIONS.width.toString(),
        guidance_scale: options.guidance_scale?.toString() || DEFAULT_OPTIONS.guidance_scale.toString(),
        steps: options.steps?.toString() || DEFAULT_OPTIONS.steps.toString(),
        max_seq_length: options.max_seq_length?.toString() || DEFAULT_OPTIONS.max_seq_length.toString()
      };

      if (options.seed) {
        params.seed = options.seed.toString();
      }

      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: ImageGenerationResponse = await response.json();
      
      setResult(data);
      setGeneratedImageUrl(`data:image/png;base64,${data.image}`);
      
      onImageGenerated?.(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, onImageGenerated, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const options: ImageGenerationOptions = {
      prompt,
      height,
      width,
      guidance_scale: guidanceScale,
      steps,
      max_seq_length: DEFAULT_OPTIONS.max_seq_length,
      ...(seed !== '' && { seed: Number(seed) })
    };

    try {
      await generateImage(options);
    } catch (err) {
      // Error is already handled in generateImage
      console.error('Generation failed:', err);
    }
  };

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  return (
    <div className={`w-full max-w-4xl mx-auto p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="mb-6">
          <label htmlFor="prompt" className="block text-sm font-semibold text-gray-700 mb-2">
            Prompt <span className="text-red-500">*</span>
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            rows={3}
            required
            disabled={loading}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="width" className="block text-sm font-semibold text-gray-700 mb-2">
              Width
            </label>
            <input
              type="number"
              id="width"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min={128}
              max={2048}
              step={64}
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
          
          <div>
            <label htmlFor="height" className="block text-sm font-semibold text-gray-700 mb-2">
              Height
            </label>
            <input
              type="number"
              id="height"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min={128}
              max={2048}
              step={64}
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="guidance-scale" className="block text-sm font-semibold text-gray-700 mb-2">
              Guidance Scale
              <span className="text-xs text-gray-500 ml-2">Controls creativity (1.0-20.0)</span>
            </label>
            <input
              type="number"
              id="guidance-scale"
              value={guidanceScale}
              onChange={(e) => setGuidanceScale(Number(e.target.value))}
              min={1.0}
              max={20.0}
              step={0.5}
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
          
          <div>
            <label htmlFor="steps" className="block text-sm font-semibold text-gray-700 mb-2">
              Steps
              <span className="text-xs text-gray-500 ml-2">More steps = higher quality</span>
            </label>
            <input
              type="number"
              id="steps"
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
              min={1}
              max={50}
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="mb-8">
          <label htmlFor="seed" className="block text-sm font-semibold text-gray-700 mb-2">
            Seed (optional)
            <span className="text-xs text-gray-500 ml-2">For reproducible results</span>
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              id="seed"
              value={seed}
              onChange={(e) => setSeed(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Random"
              disabled={loading}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={handleRandomSeed}
              disabled={loading}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Random
            </button>
          </div>
        </div>

        <div className="text-center">
          <button 
            type="submit" 
            disabled={loading || !prompt.trim()}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-3 mx-auto"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Image'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <div className="text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {result && generatedImageUrl && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Generated Image</h3>
          
          <div className="text-center mb-6">
            <img 
              src={generatedImageUrl} 
              alt={`Generated: ${result.parameters.prompt}`}
              className="max-w-full h-auto rounded-lg shadow-md mx-auto"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-600">Generation Time</div>
              <div className="text-lg font-bold text-gray-800">{result.generation_time}s</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-600">Dimensions</div>
              <div className="text-lg font-bold text-gray-800">{result.parameters.width} × {result.parameters.height}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-600">Seed</div>
              <div className="text-lg font-bold text-gray-800">{result.parameters.seed || 'Random'}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-600">Steps</div>
              <div className="text-lg font-bold text-gray-800">{result.parameters.num_steps}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-600">Guidance</div>
              <div className="text-lg font-bold text-gray-800">{result.parameters.guidance_scale}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = generatedImageUrl;
                link.download = `jaguar-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Image
            </button>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(result.parameters.prompt);
              }}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Prompt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JaguarImageGenerator;
