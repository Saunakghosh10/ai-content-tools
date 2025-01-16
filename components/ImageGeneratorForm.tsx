'use client';

import { useState } from 'react';
import { ImageIcon, Download, Loader2, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const modelOptions = [
  { value: 'stable-diffusion', label: 'Stable Diffusion XL' },
];

const stylePresets = [
  { value: 'photographic', label: 'Photographic' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'anime', label: '3D Anime' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'fantasy', label: 'Fantasy Art' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'neon', label: 'Neon Art' },
  { value: 'painting', label: 'Oil Painting' }
];

export function ImageGeneratorForm() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [model, setModel] = useState('stable-diffusion');
  const [style, setStyle] = useState('photographic');
  const [numImages, setNumImages] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError('');
    setImages([]);

    try {
      console.log('Sending request with:', { prompt, negativePrompt, model, style, numImages });

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          model,
          style,
          numImages
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate images');
      }

      if (!data.images || !Array.isArray(data.images)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from API');
      }

      if (data.images.length === 0) {
        console.error('No images in response:', data);
        throw new Error('No images were generated');
      }

      // Log each image URL
      data.images.forEach((url: string, index: number) => {
        console.log(`Image ${index + 1} URL:`, url);
      });

      setImages(data.images);
    } catch (err) {
      console.error('Image generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate images. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download image. Please try again.');
    }
  };

  const handleImageLoad = (imageUrl: string) => {
    console.log('Image loaded successfully:', imageUrl);
  };

  const handleImageError = (imageUrl: string) => {
    console.error('Failed to load image:', imageUrl);
    setError(`Failed to load one or more images. Please try generating again.`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Controls */}
        <div className="space-y-6 bg-card rounded-xl p-6 border shadow-sm">
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Prompt</Label>
            <Textarea
              placeholder="Describe what you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] text-base resize-none bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-lg font-semibold">Negative Prompt <span className="text-sm font-normal text-muted-foreground">(Optional)</span></Label>
            <Textarea
              placeholder="Describe what you don't want in the image..."
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              className="min-h-[80px] text-base resize-none bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="h-11 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sdxl">Stable Diffusion XL</SelectItem>
                  <SelectItem value="sd">Stable Diffusion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-lg font-semibold">Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="h-11 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photographic">Photographic</SelectItem>
                  <SelectItem value="digital-art">Digital Art</SelectItem>
                  <SelectItem value="anime">Anime</SelectItem>
                  <SelectItem value="cinematic">Cinematic</SelectItem>
                  <SelectItem value="fantasy">Fantasy</SelectItem>
                  <SelectItem value="abstract">Abstract</SelectItem>
                  <SelectItem value="neon">Neon</SelectItem>
                  <SelectItem value="painting">Painting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-semibold">Number of Images</Label>
              <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                {numImages}
              </span>
            </div>
            <Slider
              min={1}
              max={4}
              step={1}
              value={[numImages]}
              onValueChange={(value) => setNumImages(value[0])}
              className="py-4"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full h-12 text-lg font-medium"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-5 w-5" />
                Generate
              </>
            )}
          </Button>

          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden h-full flex flex-col">
          <div className="p-6 border-b bg-muted/40">
            <h2 className="text-xl font-semibold">Generated Images</h2>
          </div>
          
          <div className="flex-1 p-6 overflow-auto">
            {isGenerating ? (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Creating your masterpiece...</p>
              </div>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 auto-rows-fr">
                {images.map((imageUrl, index) => (
                  <div 
                    key={`${imageUrl}-${index}`} 
                    className="relative aspect-square rounded-lg overflow-hidden bg-background shadow-sm"
                  >
                    <img
                      src={imageUrl}
                      alt={`Generated image ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      onLoad={() => handleImageLoad(imageUrl)}
                      onError={() => handleImageError(imageUrl)}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownload(imageUrl)}
                        className="transform translate-y-2 group-hover:translate-y-0 transition-transform"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <ImageIcon className="h-12 w-12" />
                <div className="text-center">
                  <p className="font-medium">No images generated yet</p>
                  <p className="text-sm">Your creations will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
