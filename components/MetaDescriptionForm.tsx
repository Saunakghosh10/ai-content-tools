'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, RefreshCcw, Copy, Check, AlertCircle, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MetaDescription {
  description: string;
  characterCount: number;
  keywordDensity: number;
}

const AI_MODELS = [
  {
    category: "Popular Models",
    models: [
      { 
        value: 'gpt3.5', 
        label: 'GPT-3.5 Turbo', 
        keyType: 'OPENAI_API_KEY',
        keyPlaceholder: 'Enter your OpenAI API key'
      },
      { 
        value: 'gpt4', 
        label: 'GPT-4', 
        keyType: 'OPENAI_API_KEY',
        keyPlaceholder: 'Enter your OpenAI API key'
      },
      { 
        value: 'claude', 
        label: 'Claude 3', 
        keyType: 'ANTHROPIC_API_KEY',
        keyPlaceholder: 'Enter your Anthropic API key'
      },
      { 
        value: 'gemini', 
        label: 'Gemini Pro', 
        keyType: 'GOOGLE_AI_KEY',
        keyPlaceholder: 'Enter your Google AI API key'
      }
    ]
  },
  {
    category: "Open Source Models",
    models: [
      { 
        value: 'llama2', 
        label: 'Llama 2', 
        keyType: 'REPLICATE_API_KEY',
        keyPlaceholder: 'Enter your Replicate API key'
      },
      { 
        value: 'mistral', 
        label: 'Mistral-7B', 
        keyType: 'HUGGINGFACE_API_KEY',
        keyPlaceholder: 'Enter your Hugging Face API key'
      }
    ]
  }
];

export default function MetaDescriptionForm() {
  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [generatedDescriptions, setGeneratedDescriptions] = useState<MetaDescription[]>([]);
  const [selectedDescription, setSelectedDescription] = useState<MetaDescription | null>(null);
  const [selectedModel, setSelectedModel] = useState('gpt3.5');
  const [apiKey, setApiKey] = useState('');

  const MAX_LENGTH = 160;
  const MIN_LENGTH = 120;
  const OPTIMAL_KEYWORD_DENSITY = 2; // percentage

  const currentModel = AI_MODELS.flatMap(category => category.models).find(model => model.value === selectedModel);

  const handleGenerate = async () => {
    if (!title || !keywords || !content) {
      setError('Please fill in all fields');
      return;
    }

    if (!apiKey) {
      setError('Please enter an API key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/meta-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          keywords,
          content,
          model: selectedModel,
          apiKey
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate meta description');
      }

      const data = await response.json();
      
      // Process and analyze each generated description
      const processedDescriptions = data.descriptions.map((desc: string) => {
        const keywordCount = keywords.split(',').reduce((count, keyword) => {
          const regex = new RegExp(keyword.trim(), 'gi');
          return count + (desc.match(regex) || []).length;
        }, 0);
        
        const wordCount = desc.split(' ').length;
        const keywordDensity = (keywordCount / wordCount) * 100;

        return {
          description: desc,
          characterCount: desc.length,
          keywordDensity: Number(keywordDensity.toFixed(1))
        };
      });

      setGeneratedDescriptions(processedDescriptions);
      setSelectedDescription(processedDescriptions[0]);
    } catch (err) {
      setError('Failed to generate meta description. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCharacterCountColor = (count: number) => {
    if (count < MIN_LENGTH) return 'text-yellow-500';
    if (count > MAX_LENGTH) return 'text-red-500';
    return 'text-green-500';
  };

  const getKeywordDensityColor = (density: number) => {
    if (density < 1) return 'text-yellow-500';
    if (density > 3) return 'text-red-500';
    return 'text-green-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Meta Description Generator
        </CardTitle>
        <CardDescription>
          Generate SEO-optimized meta descriptions with optimal length and keyword density
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 p-4 rounded-lg border bg-card/50">
          <div className="space-y-2">
            <Label>Select AI Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select an AI model" />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((category) => (
                  <div key={category.category}>
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                      {category.category}
                    </div>
                    {category.models.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Key
            </Label>
            <Input
              type="password"
              placeholder={currentModel?.keyPlaceholder}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Using {currentModel?.keyType}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Page Title</Label>
          <Input
            id="title"
            placeholder="Enter your page title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords">Target Keywords</Label>
          <Input
            id="keywords"
            placeholder="Enter keywords (comma-separated)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Page Content</Label>
          <Textarea
            id="content"
            placeholder="Enter your page content for context"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-32"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <Button 
          onClick={handleGenerate} 
          disabled={loading} 
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Meta Description'
          )}
        </Button>

        {generatedDescriptions.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Generated Descriptions</h3>
            {generatedDescriptions.map((desc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border bg-card/50 space-y-2"
              >
                <p className="text-sm">{desc.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="space-x-4">
                    <span className={getCharacterCountColor(desc.characterCount)}>
                      {desc.characterCount} characters
                    </span>
                    <span className={getKeywordDensityColor(desc.keywordDensity)}>
                      {desc.keywordDensity}% keyword density
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(desc.description)}
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 