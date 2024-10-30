'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, FileText, Sparkles, ArrowRight, Search, Brain, Zap } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

const tools = [
  {
    title: 'Article Writer',
    description: 'Generate high-quality articles with AI assistance',
    icon: <FileText className="w-6 h-6" />,
    href: '/article-writer',
    gradient: 'from-blue-500 to-cyan-500',
    delay: 0.1
  },
  {
    title: 'Keyword Research',
    description: 'Discover valuable keywords for your content',
    icon: <Search className="w-6 h-6" />,
    href: '/keyword-research',
    gradient: 'from-green-500 to-emerald-500',
    delay: 0.2
  },
  {
    title: 'Coming Soon',
    description: 'More AI tools are on the way',
    icon: <Sparkles className="w-6 h-6" />,
    href: '/coming-soon',
    gradient: 'from-purple-500 to-pink-500',
    delay: 0.3
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
          {/* Hero Section */}
          <motion.div 
            className="text-center space-y-6"
            variants={itemVariants}
          >
            <motion.div
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Bot className="w-12 h-12 text-primary" />
            </motion.div>
            
            <h1 className="text-5xl font-bold text-foreground tracking-tight">
              AI Content Tools
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              Create high-quality content with the power of artificial intelligence
            </p>
          </motion.div>

          {/* Tools Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {tools.map((tool) => (
              <motion.div
                key={tool.title}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-full"
              >
                <Link href={tool.href} className="h-full block">
                  <motion.div 
                    className={`relative group overflow-hidden rounded-xl border bg-card p-8 h-full flex flex-col hover:shadow-lg transition-all duration-200`}
                  >
                    <motion.div 
                      className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-r ${tool.gradient} transition-opacity duration-300`}
                      initial={false}
                    />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 p-2 rounded-lg bg-primary/10 text-primary">
                          {tool.icon}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-semibold text-foreground">
                              {tool.title}
                            </h2>
                            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                          </div>
                          <p className="text-muted-foreground">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Features Section */}
          <motion.div 
            className="space-y-8 mt-16"
            variants={itemVariants}
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Powered by Advanced AI
              </h2>
              <p className="text-muted-foreground">
                Choose from multiple AI models to create the perfect content
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: <Bot className="w-6 h-6" />,
                  title: "Multiple AI Models",
                  description: "Choose from GPT-4, Claude, Gemini, and more"
                },
                {
                  icon: <Brain className="w-6 h-6" />,
                  title: "Smart Analysis",
                  description: "Get intelligent insights and recommendations"
                },
                {
                  icon: <Zap className="w-6 h-6" />,
                  title: "Fast & Efficient",
                  description: "Quick results with high accuracy"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="p-6 rounded-xl border bg-card"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
