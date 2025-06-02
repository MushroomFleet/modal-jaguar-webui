'use client';

import { useState } from 'react';
import JaguarImageGenerator from '../components/JaguarImageGenerator';
import { ImageGenerationResponse } from '../types/jaguar-api';

export default function Home() {
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<ImageGenerationResponse[]>([]);

  const handleApiUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiBaseUrl.trim()) {
      setIsConfigured(true);
    }
  };

  const handleImageGenerated = (result: ImageGenerationResponse) => {
    setGeneratedImages(prev => [result, ...prev]);
  };

  const handleError = (error: string) => {
    console.error('Image generation error:', error);
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Jaguar AI Image Generator
            </h1>
            <p className="text-gray-600">
              Powered by Shuttle-Jaguar 8B Model
            </p>
          </div>

          <form onSubmit={handleApiUrlSubmit} className="space-y-6">
            <div>
              <label htmlFor="apiUrl" className="block text-sm font-semibold text-gray-700 mb-2">
                Modal API Base URL
              </label>
              <input
                type="url"
                id="apiUrl"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder="https://your-username--shuttle-jaguar"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter your Modal deployment base URL (without the endpoint suffix)
              </p>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Start Generating Images
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Need help?</h3>
            <p className="text-xs text-blue-700">
              Your Modal URL should look like: <br />
              <code className="bg-blue-100 px-1 rounded">https://username--shuttle-jaguar</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Jaguar AI Image Generator</h1>
                <p className="text-sm text-gray-600">Shuttle-Jaguar 8B Model</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsConfigured(false);
                setApiBaseUrl('');
                setGeneratedImages([]);
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Change API URL
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generator */}
          <div className="lg:col-span-2">
            <JaguarImageGenerator
              apiBaseUrl={apiBaseUrl}
              onImageGenerated={handleImageGenerated}
              onError={handleError}
            />
          </div>

          {/* Gallery */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Generations</h2>
              
              {generatedImages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No images generated yet</p>
                  <p className="text-gray-400 text-xs mt-1">Your generated images will appear here</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {generatedImages.map((image, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <img
                        src={`data:image/png;base64,${image.image}`}
                        alt={image.parameters.prompt}
                        className="w-full h-32 object-cover rounded-md mb-2"
                      />
                      <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                        {image.parameters.prompt}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{image.parameters.width}×{image.parameters.height}</span>
                        <span>{image.generation_time}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            {generatedImages.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{generatedImages.length}</div>
                    <div className="text-xs text-gray-600">Images Generated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(generatedImages.reduce((sum, img) => sum + img.generation_time, 0) / generatedImages.length).toFixed(1)}s
                    </div>
                    <div className="text-xs text-gray-600">Avg Generation Time</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
