'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Brain, Zap, ArrowRight, FileText, Search, MessageSquare, Code, Headphones, Video, LineChart } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

const upcomingFeatures = [
  {
    title: 'Code Generator',
    description: 'Generate code snippets in various programming languages with AI assistance',
    icon: <Code className="w-6 h-6" />,
    gradient: 'from-blue-500 to-cyan-500',
    eta: 'Coming in May'
  },
  {
    title: 'Audio Transcription',
    description: 'Convert audio files to text with high accuracy using AI',
    icon: <Headphones className="w-6 h-6" />,
    gradient: 'from-purple-500 to-pink-500',
    eta: 'Coming in June'
  },
  {
    title: 'Video Generator',
    description: 'Create engaging videos with AI-powered assistance',
    icon: <Video className="w-6 h-6" />,
    gradient: 'from-orange-500 to-red-500',
    eta: 'Coming in July'
  },
  {
    title: 'Social Media Assistant',
    description: 'Generate and optimize social media content with AI',
    icon: <MessageSquare className="w-6 h-6" />,
    gradient: 'from-green-500 to-emerald-500',
    eta: 'Coming in August'
  },
  {
    title: 'SEO Optimizer',
    description: 'Optimize your content for better search engine rankings using AI',
    icon: <LineChart className="w-6 h-6" />,
    gradient: 'from-yellow-500 to-orange-500',
    eta: 'Coming in September'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function ComingSoonPage() {
  return (
    <div className="container mx-auto">
      <div className="min-h-screen p-8 pb-20 sm:p-20 bg-background">
        <motion.div 
          className="absolute top-4 right-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ModeToggle />
        </motion.div>

        <motion.div 
          className="max-w-4xl mx-auto space-y-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <motion.div
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Sparkles className="w-12 h-12 text-primary" />
            </motion.div>
            
            <h1 className="text-5xl font-bold text-foreground tracking-tight">
              Coming Soon
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              We're working on exciting new AI tools to help you create better content
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingFeatures.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-full"
              >
                <div className={`relative group overflow-hidden rounded-xl border bg-card p-8 h-full flex flex-col hover:shadow-lg transition-all duration-200`}>
                  <motion.div 
                    className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-r ${feature.gradient} transition-opacity duration-300`}
                    initial={false}
                  />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {feature.icon}
                      </div>
                      <div className="space-y-2 flex-1">
                        <h2 className="text-xl font-semibold text-foreground">
                          {feature.title}
                        </h2>
                        <p className="text-muted-foreground">
                          {feature.description}
                        </p>
                        <p className="text-sm text-primary font-medium">
                          {feature.eta}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={itemVariants} className="text-center">
            <Link 
              href="/" 
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Available Tools
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}