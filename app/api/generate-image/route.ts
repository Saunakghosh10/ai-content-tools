import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.replicate || '',
});

export async function POST(req: Request) {
  try {
    const { prompt, negativePrompt, model, style, numImages = 1 } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    let enhancedPrompt = prompt;
    if (style) {
      const stylePrompts: { [key: string]: string } = {
        'photographic': 'professional photography, 8k uhd, high quality, detailed',
        'digital-art': 'digital art style, vibrant colors, detailed',
        'anime': '3D anime art style, cel shading, vibrant',
        'cinematic': 'cinematic shot, dramatic lighting, movie scene quality',
        'fantasy': 'fantasy art style, magical, ethereal, detailed',
        'abstract': 'abstract art style, contemporary, modern art',
        'neon': 'neon art style, cyberpunk, glowing elements',
        'painting': 'oil painting style, artistic, detailed brushstrokes'
      };
      
      enhancedPrompt = `${prompt}, ${stylePrompts[style] || ''}`;
    }

    // Create the prediction
    const prediction = await replicate.predictions.create({
      version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
      input: {
        prompt: enhancedPrompt,
        negative_prompt: negativePrompt || "blurry, bad quality, distorted",
        num_outputs: numImages,
        scheduler: "DPMSolverMultistep",
        num_inference_steps: 25,
        guidance_scale: 7.5,
        width: 768,
        height: 768,
      },
    });

    console.log('Prediction created:', prediction);

    // Wait for the prediction to complete
    const result = await replicate.wait(prediction);
    console.log('Prediction result:', result);

    if (!result || !result.output || !Array.isArray(result.output)) {
      console.error('Invalid result format:', result);
      throw new Error('Failed to generate images');
    }

    // Filter out any invalid URLs
    const validUrls = result.output.filter(url => {
      const isValid = typeof url === 'string' && url.startsWith('http');
      if (!isValid) {
        console.warn('Invalid URL in result:', url);
      }
      return isValid;
    });

    if (validUrls.length === 0) {
      console.error('No valid URLs in result:', result);
      throw new Error('No valid image URLs were generated');
    }

    return NextResponse.json({
      images: validUrls,
      debug: {
        status: result.status,
        urls: validUrls.length,
      }
    });

  } catch (error: any) {
    console.error('Image generation error:', error);
    
    let errorMessage = 'Failed to generate images';
    
    if (error.response) {
      try {
        const errorData = await error.response.json();
        console.error('API Error Response:', errorData);
        errorMessage = errorData.detail || errorData.error || errorMessage;
      } catch {
        errorMessage = error.message || errorMessage;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        debug: {
          message: error.message,
          name: error.name,
        }
      },
      { status: 500 }
    );
  }
}
