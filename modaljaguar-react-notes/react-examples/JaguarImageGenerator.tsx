import React, { useState, useCallback } from 'react';
import { 
  ImageGenerationOptions, 
  ImageGenerationResponse, 
  validateGenerationOptions,
  DEFAULT_OPTIONS 
} from '../jaguar-api-types';

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
      const params = {
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
    <div className={`jaguar-image-generator ${className}`}>
      <form onSubmit={handleSubmit} className="generation-form">
        <div className="form-group">
          <label htmlFor="prompt">
            Prompt <span className="required">*</span>
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            rows={3}
            required
            disabled={loading}
            className="form-control"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="width">Width</label>
            <input
              type="number"
              id="width"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min={128}
              max={2048}
              step={64}
              disabled={loading}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="height">Height</label>
            <input
              type="number"
              id="height"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min={128}
              max={2048}
              step={64}
              disabled={loading}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="guidance-scale">
              Guidance Scale
              <span className="help-text">Controls creativity (1.0-20.0)</span>
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
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="steps">
              Steps
              <span className="help-text">More steps = higher quality</span>
            </label>
            <input
              type="number"
              id="steps"
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
              min={1}
              max={50}
              disabled={loading}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="seed">
            Seed (optional)
            <span className="help-text">For reproducible results</span>
          </label>
          <div className="seed-input-group">
            <input
              type="number"
              id="seed"
              value={seed}
              onChange={(e) => setSeed(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Random"
              disabled={loading}
              className="form-control"
            />
            <button
              type="button"
              onClick={handleRandomSeed}
              disabled={loading}
              className="btn btn-secondary"
            >
              Random
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={loading || !prompt.trim()}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <span className="spinner" />
                Generating...
              </>
            ) : (
              'Generate Image'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && generatedImageUrl && (
        <div className="result-section">
          <h3>Generated Image</h3>
          
          <div className="image-container">
            <img 
              src={generatedImageUrl} 
              alt={`Generated: ${result.parameters.prompt}`}
              className="generated-image"
            />
          </div>
          
          <div className="result-details">
            <div className="detail-item">
              <strong>Generation Time:</strong> {result.generation_time}s
            </div>
            <div className="detail-item">
              <strong>Dimensions:</strong> {result.parameters.width} × {result.parameters.height}
            </div>
            <div className="detail-item">
              <strong>Seed:</strong> {result.parameters.seed || 'Random'}
            </div>
            <div className="detail-item">
              <strong>Steps:</strong> {result.parameters.num_steps}
            </div>
            <div className="detail-item">
              <strong>Guidance:</strong> {result.parameters.guidance_scale}
            </div>
          </div>

          <div className="result-actions">
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = generatedImageUrl;
                link.download = `jaguar-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="btn btn-secondary"
            >
              Download Image
            </button>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(result.parameters.prompt);
              }}
              className="btn btn-secondary"
            >
              Copy Prompt
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .jaguar-image-generator {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .generation-form {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          border: 1px solid #e9ecef;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #343a40;
        }

        .required {
          color: #dc3545;
        }

        .help-text {
          font-weight: normal;
          font-size: 0.85em;
          color: #6c757d;
          margin-left: 5px;
        }

        .form-control {
          width: 100%;
          padding: 12px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.15s ease-in-out;
          box-sizing: border-box;
        }

        .form-control:focus {
          outline: none;
          border-color: #0066cc;
          box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
        }

        .form-control:disabled {
          background-color: #e9ecef;
          opacity: 0.7;
        }

        textarea.form-control {
          resize: vertical;
          min-height: 80px;
        }

        .seed-input-group {
          display: flex;
          gap: 10px;
        }

        .seed-input-group .form-control {
          flex: 1;
        }

        .form-actions {
          text-align: center;
          margin-top: 30px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background-color: #0066cc;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #0052a3;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #5a6268;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #f5c6cb;
          margin-bottom: 20px;
        }

        .result-section {
          background: white;
          padding: 30px;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .result-section h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #343a40;
        }

        .image-container {
          text-align: center;
          margin-bottom: 25px;
        }

        .generated-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .result-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .detail-item {
          font-size: 14px;
        }

        .detail-item strong {
          color: #495057;
        }

        .result-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .jaguar-image-generator {
            padding: 15px;
          }

          .generation-form {
            padding: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .result-details {
            grid-template-columns: 1fr;
          }

          .result-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default JaguarImageGenerator;
