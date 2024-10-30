'use client';

import { useState } from 'react';
import { Bot, Brain, Info, Key, Loader2, Sparkles, FileText } from 'lucide-react';
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
      },
      { 
        value: 'gemini', 
        label: 'Gemini Pro', 
        icon: <Bot className="w-4 h-4" />,
        apiKeyType: 'Google API Key',
        apiKeyInfo: 'Requires Google AI Studio API key from makersuite.google.com'
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

export default function ArticleWriterForm() {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('professional');
  const [model, setModel] = useState('chatgpt');
  const [apiKey, setApiKey] = useState('');
  const [article, setArticle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/article-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic, 
          keywords, 
          tone,
          model, 
          apiKey 
        }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setArticle(data.article);
      }
    } catch (err) {
      setError('Failed to generate article');
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
                <FileText className="w-4 h-4" />
                Topic
              </div>
              <motion.input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 block w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="e.g., Benefits of Meditation"
                required
                whileFocus={{ scale: 1.01 }}
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/90">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                Keywords (comma separated)
              </div>
              <motion.input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="mt-1 block w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="e.g., meditation benefits, mindfulness, stress reduction"
                required
                whileFocus={{ scale: 1.01 }}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/90">
                Tone
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="mt-1 block w-full rounded-lg border bg-background px-4 py-3 text-foreground"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="friendly">Friendly</option>
                </select>
              </label>
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-2 text-foreground/90">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4" />
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
              Generating Article...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Generate Article
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

      {article && (
        <motion.div 
          className="bg-card rounded-xl shadow-lg p-8 border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5" />
            Generated Article
          </h2>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {article.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
} 