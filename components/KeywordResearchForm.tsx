'use client';


import { useState } from 'react';
import { Search, Key, Cpu, Loader2, Tag, Bot, Sparkles, Brain, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyword } from '@/app/types/keyword';

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
      },
      { 
        value: 'gemini', 
        label: 'Gemini Pro', 
        icon: <Bot className="w-4 h-4" />,
        apiKeyType: 'Google API Key',
        apiKeyInfo: 'Requires Google AI Studio API key from makersuite.google.com'
      },
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
        value: 'falcon', 
        label: 'Mistral-7B', // Updated label
        icon: <Sparkles className="w-4 h-4" />,
        apiKeyType: 'Hugging Face API Key',
        apiKeyInfo: 'Requires Hugging Face API key from huggingface.co'
      }
    ]
  }
];

export default function KeywordResearchForm() {
  const [niche, setNiche] = useState('');
  const [model, setModel] = useState('chatgpt');
  const [apiKey, setApiKey] = useState('');
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/keyword-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, model, apiKey }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setKeywords(data.keywords);
      }
    } catch (err) {
      setError('Failed to perform keyword research');
    } finally {
      setLoading(false);
    }
  };

  const selectedModel = AI_MODELS.flatMap(category => category.models).find(m => m.value === model);

  return (
    <div className="w-full space-y-8">
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-6 bg-card rounded-xl shadow-lg p-8 border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/90">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4" />
                Niche
              </div>
              <motion.input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="mt-1 block w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="e.g., organic gardening"
                required
                whileFocus={{ scale: 1.01 }}
              />
            </label>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-2 text-foreground/90">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4" />
                AI Model
              </div>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="mt-1 block w-full rounded-lg border bg-background px-4 py-3 text-left text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  {selectedModel?.icon}
                  {selectedModel?.label}
                </div>
              </button>
            </label>

            {isDropdownOpen && (
              <motion.div 
                className="absolute z-10 mt-1 w-full rounded-lg border bg-card shadow-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {AI_MODELS.map((category, idx) => (
                  <div key={idx} className="p-2">
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                      {category.category}
                    </div>
                    {category.models.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => {
                          setModel(m.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-accent transition-colors ${
                          model === m.value ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {m.icon}
                          {m.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {m.apiKeyType}
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/90">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4" />
                {selectedModel?.apiKeyType || 'API Key'}
              </div>
              <motion.input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1 block w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder={`Enter your ${selectedModel?.apiKeyType || 'API key'}`}
                required
                whileFocus={{ scale: 1.01 }}
              />
              {selectedModel && (
                <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{selectedModel.apiKeyInfo}</span>
                </div>
              )}
            </label>
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
              Generating Keywords...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Generate Keywords
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

      {keywords.length > 0 && (
        <motion.div 
          className="bg-card rounded-xl shadow-lg p-8 border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-foreground">
            <Tag className="w-5 h-5" />
            Generated Keywords
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {keywords.map((keyword, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-accent/50 rounded-lg flex flex-col gap-2 hover:bg-accent transition-all duration-200 group border"
              >
                <span className="font-medium text-foreground group-hover:text-foreground/90 transition-colors">
                  {keyword.keyword}
                </span>
                <span className="text-xs text-muted-foreground px-2 py-1 bg-background/50 rounded-full w-fit">
                  {keyword.category}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
