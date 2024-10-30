'use client';

import { useState } from 'react';
import { Zap, Key, Info, Loader2, Bot, Sparkles, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const AI_MODELS = [
  {
    category: "Popular Models",
    models: [
      { 
        value: 'chatgpt', 
        label: 'ChatGPT (GPT-3.5)', 
        icon: <Bot className="w-4 h-4" />,
        apiKeyType: 'OpenAI API Key',
        apiKeyInfo: 'Requires OpenAI API key from platform.openai.com'
      },
      { 
        value: 'gpt4', 
        label: 'GPT-4', 
        icon: <Sparkles className="w-4 h-4" />,
        apiKeyType: 'OpenAI API Key',
        apiKeyInfo: 'Requires OpenAI API key from platform.openai.com'
      },
      { 
        value: 'claude', 
        label: 'Claude 3', 
        icon: <Brain className="w-4 h-4" />,
        apiKeyType: 'Anthropic API Key',
        apiKeyInfo: 'Requires Anthropic API key from console.anthropic.com'
      }
    ]
  },
  {
    category: "Open Source Models",
    models: [
      { 
        value: 'llama2', 
        label: 'Llama 2', 
        icon: <Bot className="w-4 h-4" />,
        apiKeyType: 'Replicate API Key',
        apiKeyInfo: 'Requires Replicate API key from replicate.com'
      },
      { 
        value: 'mistral', 
        label: 'Mistral-7B', 
        icon: <Sparkles className="w-4 h-4" />,
        apiKeyType: 'Hugging Face API Key',
        apiKeyInfo: 'Requires Hugging Face API key from huggingface.co'
      }
    ]
  }
];

interface OptimizationResult {
  readabilityScore: number;
  seoScore: number;
  suggestions: string[];
  optimizedContent: string;
}

export default function ContentOptimizerForm() {
  const [content, setContent] = useState('');
  const [targetKeywords, setTargetKeywords] = useState('');
  const [model, setModel] = useState('chatgpt');
  const [apiKey, setApiKey] = useState('');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/content-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content,
          targetKeywords,
          model,
          apiKey
        }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Failed to optimize content');
    } finally {
      setLoading(false);
    }
  };

  const selectedModel = AI_MODELS.flatMap(category => category.models).find(m => m.value === model);

  return (
    <div className="w-full space-y-8">
      <motion.form 
        onSubmit={handleSubmit}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Content to Optimize</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-48 p-4 rounded-lg bg-background border resize-none focus:ring-2 focus:ring-primary"
              placeholder="Paste your content here..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Keywords</label>
            <input
              type="text"
              value={targetKeywords}
              onChange={(e) => setTargetKeywords(e.target.value)}
              className="w-full p-4 rounded-lg bg-background border focus:ring-2 focus:ring-primary"
              placeholder="Enter target keywords (comma-separated)"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-2">AI Model</label>
            <div 
              className="w-full p-4 rounded-lg bg-background border cursor-pointer flex items-center justify-between"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center gap-2">
                {selectedModel?.icon}
                <span>{selectedModel?.label}</span>
              </div>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            
            {isDropdownOpen && (
              <div className="absolute w-full mt-2 p-2 rounded-lg bg-background border shadow-lg z-10">
                {AI_MODELS.map((category) => (
                  <div key={category.category}>
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">{category.category}</div>
                    {category.models.map((m) => (
                      <div
                        key={m.value}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent ${model === m.value ? 'bg-accent' : ''}`}
                        onClick={() => {
                          setModel(m.value);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {m.icon}
                        <div>
                          <div>{m.label}</div>
                          <div className="text-xs text-muted-foreground">{m.apiKeyInfo}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              {selectedModel?.apiKeyType}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-4 rounded-lg bg-background border focus:ring-2 focus:ring-primary"
              placeholder="Enter your API key"
              required
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Optimizing Content...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Optimize Content
            </>
          )}
        </motion.button>
      </motion.form>

      {error && (
        <motion.div 
          className="bg-destructive/10 border-destructive/20 border text-destructive p-6 rounded-xl flex items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-2 h-2 rounded-full bg-destructive" />
          {error}
        </motion.div>
      )}

      {result && (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-xl bg-card border">
              <div className="text-2xl font-bold mb-2">{result.readabilityScore}</div>
              <div className="text-sm text-muted-foreground">Readability Score</div>
            </div>
            <div className="p-6 rounded-xl bg-card border">
              <div className="text-2xl font-bold mb-2">{result.seoScore}</div>
              <div className="text-sm text-muted-foreground">SEO Score</div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border">
            <h3 className="text-lg font-semibold mb-4">Suggestions</h3>
            <ul className="space-y-2">
              {result.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card rounded-xl p-6 border">
            <h3 className="text-lg font-semibold mb-4">Optimized Content</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {result.optimizedContent.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 