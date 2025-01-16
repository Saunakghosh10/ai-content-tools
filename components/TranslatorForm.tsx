'use client';

import { useState } from 'react';
import { Languages, ArrowRightLeft, Copy, Volume2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ur', name: 'Urdu' },
  { code: 'tr', name: 'Turkish' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ms', name: 'Malay' },
  { code: 'fa', name: 'Persian' },
  { code: 'he', name: 'Hebrew' },
  { code: 'pl', name: 'Polish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'el', name: 'Greek' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'cs', name: 'Czech' },
];

export function TranslatorForm() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      setTranslatedText(data.translatedText);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  const handleTextChange = (text: string) => {
    setSourceText(text);
    setCharacterCount(text.length);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Language Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg shadow-sm">
            <Label className="text-lg font-medium">Source Language</Label>
            <Select value={sourceLang} onValueChange={setSourceLang}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Textarea
              placeholder="Enter text to translate..."
              value={sourceText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="h-[250px] resize-none text-lg p-4 bg-card/50 focus:bg-card"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {characterCount} characters
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSpeak(sourceText, sourceLang)}
                disabled={!sourceText}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopyText(sourceText)}
                disabled={!sourceText}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Swap Languages Button */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-background shadow-md hover:scale-110 transition-transform"
            onClick={handleSwapLanguages}
          >
            <ArrowRightLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Target Language Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg shadow-sm">
            <Label className="text-lg font-medium">Target Language</Label>
            <Select value={targetLang} onValueChange={setTargetLang}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Textarea
              placeholder="Translation will appear here..."
              value={translatedText}
              readOnly
              className="h-[250px] resize-none text-lg p-4 bg-muted"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSpeak(translatedText, targetLang)}
                disabled={!translatedText}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopyText(translatedText)}
                disabled={!translatedText}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <motion.div 
        className="flex justify-center"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={handleTranslate}
          disabled={isLoading || !sourceText.trim()}
          className="w-full md:w-auto text-lg px-8 py-6 bg-gradient-to-r from-primary/90 to-primary shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isLoading ? (
            <span className="flex items-center gap-3">
              <Languages className="w-5 h-5 animate-spin" />
              Translating...
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <Languages className="w-5 h-5" />
              Translate
            </span>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
