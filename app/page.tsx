'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, FileText, Sparkles, ArrowRight, Search, Brain, Zap, Link2, Rocket, Languages, ImageIcon } from 'lucide-react';

const tools = [
  {
    title: 'Article Writer',
    description: 'Generate high-quality articles with AI assistance. Perfect for blogs, content marketing, and more.',
    icon: <FileText className="w-7 h-7" />,
    href: '/article-writer',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    delay: 0.1
  },
  {
    title: 'Keyword Research',
    description: 'Discover valuable keywords for your content. Get insights into search volume and competition.',
    icon: <Search className="w-7 h-7" />,
    href: '/keyword-research',
    gradient: 'from-green-500/20 to-emerald-500/20',
    delay: 0.2
  },
  {
    title: 'Content Optimizer',
    description: 'Enhance your content for better SEO and readability. Get actionable suggestions for improvement.',
    icon: <Zap className="w-7 h-7" />,
    href: '/content-optimizer',
    gradient: 'from-purple-500/20 to-pink-500/20',
    delay: 0.3
  },
  {
    title: 'URL Shortener',
    description: 'Create concise, shareable links instantly. Track clicks and manage your shortened URLs.',
    icon: <Link2 className="w-7 h-7" />,
    href: '/url-shortener',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    delay: 0.4
  },
  {
    title: 'Language Translator',
    description: 'Translate text between multiple languages with AI-powered accuracy and natural fluency.',
    icon: <Languages className="w-7 h-7" />,
    href: '/translator',
    gradient: 'from-red-500/20 to-pink-500/20',
    delay: 0.5
  },
  {
    title: 'Image Generator',
    description: 'Create stunning AI-generated images from text descriptions with advanced customization options.',
    icon: <ImageIcon className="w-7 h-7" />,
    href: '/image-generator',
    gradient: 'from-violet-500/20 to-indigo-500/20',
    delay: 0.6
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background dark">
      <main className="container mx-auto px-4 py-16 relative">
        <motion.div 
          className="max-w-5xl mx-auto space-y-12"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            variants={itemVariants} 
            className="text-center space-y-6 relative"
          >
            <motion.div
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Bot className="w-12 h-12 text-primary" />
            </motion.div>
            
            <h1 className="text-5xl font-bold text-foreground tracking-tight flex items-center justify-center gap-3">
              PixlTools
              <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                BETA
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful AI tools to enhance your content creation workflow
            </p>

            <motion.div
              className="flex justify-center gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/coming-soon">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Rocket className="w-5 h-5" />
                  <span>Coming Soon</span>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10"
            variants={containerVariants}
          >
            {tools.map((tool) => (
              <motion.div
                key={tool.title}
                variants={itemVariants}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={tool.href}>
                  <div className={`p-8 rounded-xl border bg-card hover:bg-accent transition-all duration-300 group relative overflow-hidden h-full`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                          {tool.icon}
                        </div>
                        <div className="space-y-2 flex-1">
                          <h2 className="text-xl font-semibold tracking-tight">{tool.title}</h2>
                          <p className="text-muted-foreground">
                            {tool.description}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
