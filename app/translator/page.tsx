'use client';

import { TranslatorForm } from '@/components/TranslatorForm';
import { Languages } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TranslatorPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div 
        className="max-w-4xl mx-auto space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex justify-center mb-6"
          >
            <div className="p-3 rounded-full bg-primary/10">
              <Languages className="w-10 h-10 text-primary" />
            </div>
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Language Translator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Translate text between multiple languages with AI-powered accuracy and natural fluency
          </p>
        </div>

        <div className="mt-12">
          <TranslatorForm />
        </div>
      </motion.div>
    </div>
  );
}
