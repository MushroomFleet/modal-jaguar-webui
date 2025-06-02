# Jaguar AI Image Generator

A powerful AI image generation application built with Next.js and powered by the Shuttle-Jaguar 8B model running on Modal's serverless infrastructure.

## Features

- **High-Quality Image Generation**: Powered by the Shuttle-Jaguar 8B parameter model
- **Customizable Parameters**: Control image dimensions, guidance scale, inference steps, and more
- **Real-time Gallery**: View all generated images in a session gallery
- **Download & Share**: Download generated images or copy prompts
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Session Statistics**: Track generation count and average generation times

## Getting Started

### Prerequisites

1. A Modal account with a deployed Shuttle-Jaguar model
2. Your Modal deployment base URL
3. Node.js and npm installed

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   ```
   Add your Hypership keys to the `.env` file

3. **Start development**:
   ```bash
   npm run dev
   ```

4. **Configure your Modal API URL**:
   - When you first open the app, you'll be prompted to enter your Modal API base URL
   - This should look like: `https://your-username--shuttle-jaguar`
   - Do not include the endpoint suffix (like `-shuttlejaguarmodel-generate-api.modal.run`)

5. **Start generating images**:
   - Enter a descriptive prompt for the image you want to generate
   - Adjust parameters as needed:
     - **Width/Height**: Image dimensions (128-2048 pixels)
     - **Guidance Scale**: Controls creativity vs adherence to prompt (1.0-20.0)
     - **Steps**: Number of inference steps (1-50, more = higher quality)
     - **Seed**: Optional seed for reproducible results

## API Parameters

### Image Generation Options

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `prompt` | string | - | - | Text description of the image to generate |
| `width` | number | 1024 | 128-2048 | Image width in pixels |
| `height` | number | 1024 | 128-2048 | Image height in pixels |
| `guidance_scale` | number | 3.5 | 1.0-20.0 | Controls creativity vs prompt adherence |
| `steps` | number | 4 | 1-50 | Number of inference steps |
| `seed` | number | random | - | Seed for reproducible results |

### Performance Tips

- **Smaller images generate faster**: 512×512 takes ~1-2s, 1024×1024 takes ~2-4s
- **Fewer steps for quick previews**: 2-4 steps for fast results, 6-8 for balanced quality
- **Higher guidance scale**: More adherence to prompt but potentially less creative
- **Lower guidance scale**: More creative but may deviate from prompt

## Modal Deployment

This app requires a Modal deployment of the Shuttle-Jaguar model. Your Modal deployment should expose these endpoints:

- `GET /generate_api` - Single image generation
- `POST /batch_api` - Batch image generation
- `GET /info` - Model information
- `POST /reload_model` - Force model reload

## Technology Stack

- **Frontend**: Next.js 15.2.4 with React 19.0.0
- **Styling**: TailwindCSS 3.4.1
- **AI Model**: Shuttle-Jaguar 8B parameters
- **Infrastructure**: Modal serverless platform
- **Backend**: Hypership (authentication, database, analytics)

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main application page
│   ├── globals.css         # Global styles
│   └── providers.tsx       # Hypership providers
├── components/
│   └── JaguarImageGenerator.tsx  # Main image generator component
├── types/
│   └── jaguar-api.ts       # TypeScript definitions for API
└── modaljaguar-react-notes/  # Documentation and examples
```

## Usage Examples

### Basic Image Generation

1. Enter a prompt: "A majestic lion in a golden savanna at sunset"
2. Keep default settings or adjust as needed
3. Click "Generate Image"
4. View the result and download if desired

### Advanced Usage

- **Reproducible Results**: Set a specific seed number
- **High Quality**: Increase steps to 8-12 for better quality
- **Creative Exploration**: Lower guidance scale to 2.0-3.0
- **Precise Control**: Higher guidance scale (5.0-8.0) for exact prompt following

## Error Handling

The app includes comprehensive error handling for:

- Invalid API URLs
- Network connectivity issues
- Model loading states (cold starts)
- Parameter validation
- Rate limiting

Common issues and solutions:

- **503 Service Unavailable**: Model is cold starting, wait 30-60 seconds and retry
- **400 Bad Request**: Check parameter values are within valid ranges
- **404 Not Found**: Verify your Modal API URL is correct

## Development

This app is built with the Hypership framework and includes:

- Authentication ready (add auth components as needed)
- Database integration (store generated images if desired)
- Event tracking (track generation metrics)
- Analytics (monitor usage patterns)

## Support

For issues related to:
- **Modal deployment**: Check Modal documentation
- **Model performance**: Refer to Shuttle-Jaguar model documentation
- **App functionality**: Check browser console for errors

## License

This project is part of the Hypership ecosystem. See individual component licenses for details.
