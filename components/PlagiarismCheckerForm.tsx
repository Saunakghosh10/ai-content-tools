'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { FileSearch, RefreshCcw, AlertCircle, Key, ExternalLink, Percent, Globe, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlagiarismResult {
  originalityScore: number;
  similarityScore: number;
  sources: {
    url: string;
    title: string;
    matchedText: string;
    similarityPercentage: number;
  }[];
  detectedQuotes: {
    text: string;
    source?: string;
  }[];
  paraphrasedContent: {
    text: string;
    similarityScore: number;
    possibleSource?: string;
  }[];
}

const AI_MODELS = [
  {
    category: "Popular Models",
    models: [
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

export default function PlagiarismCheckerForm() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt4');
  const [apiKey, setApiKey] = useState('');
  const [result, setResult] = useState<PlagiarismResult | null>(null);

  const currentModel = AI_MODELS.flatMap(category => category.models).find(model => model.value === selectedModel);

  const handleCheck = async () => {
    if (!content.trim()) {
      setError('Please enter some content to check');
      return;
    }

    if (!apiKey) {
      setError('Please enter an API key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/plagiarism-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          model: selectedModel,
          apiKey
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check plagiarism');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to check plagiarism. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 80) return 'text-green-500';
    if (score > 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number) => {
    if (score > 80) return 'bg-green-500';
    if (score > 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSearch className="w-5 h-5" />
          Plagiarism Checker
        </CardTitle>
        <CardDescription>
          Check content originality and get detailed similarity analysis
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
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-md bg-background"
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
          <Label htmlFor="content">Content to Check</Label>
          <Textarea
            id="content"
            placeholder="Enter or paste your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-48 font-mono"
          />
          <p className="text-sm text-muted-foreground">
            {content.length} characters | {content.split(/\s+/).filter(Boolean).length} words
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <Button 
          onClick={handleCheck} 
          disabled={loading} 
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            'Check Plagiarism'
          )}
        </Button>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              {/* Overall Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Originality Score</h3>
                    <Percent className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold ${getScoreColor(result.originalityScore)}`}>
                        {result.originalityScore}%
                      </span>
                    </div>
                    <Progress value={result.originalityScore} className={getProgressColor(result.originalityScore)} />
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Similarity Found</h3>
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold ${getScoreColor(100 - result.similarityScore)}`}>
                        {result.similarityScore}%
                      </span>
                    </div>
                    <Progress value={result.similarityScore} className={getProgressColor(100 - result.similarityScore)} />
                  </div>
                </div>
              </div>

              {/* Sources */}
              {result.sources.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Link2 className="w-5 h-5" />
                    Matched Sources
                  </h3>
                  <div className="space-y-4">
                    {result.sources.map((source, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg border bg-card/50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <a 
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-2"
                          >
                            {source.title}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <span className={`font-semibold ${getScoreColor(100 - source.similarityPercentage)}`}>
                            {source.similarityPercentage}% match
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {source.matchedText}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detected Quotes */}
              {result.detectedQuotes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Detected Quotes</h3>
                  <div className="space-y-2">
                    {result.detectedQuotes.map((quote, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 rounded-lg border bg-card/50"
                      >
                        <p className="text-sm">{quote.text}</p>
                        {quote.source && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Source: {quote.source}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Paraphrased Content */}
              {result.paraphrasedContent.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Potential Paraphrasing</h3>
                  <div className="space-y-2">
                    {result.paraphrasedContent.map((content, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 rounded-lg border bg-card/50"
                      >
                        <p className="text-sm">{content.text}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-sm ${getScoreColor(100 - content.similarityScore)}`}>
                            {content.similarityScore}% similar
                          </span>
                          {content.possibleSource && (
                            <span className="text-sm text-muted-foreground">
                              Possible source: {content.possibleSource}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
} 