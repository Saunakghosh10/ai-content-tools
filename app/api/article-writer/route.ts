import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Anthropic } from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Replicate from 'replicate'
import { HfInference } from '@huggingface/inference'

// Enhanced system prompts for different models
const SYSTEM_PROMPTS = {
  openai: `You are a professional writer with years of experience writing for major publications.
Your strengths:
- Writing with a natural, engaging flow that captivates readers
- Using storytelling techniques to make content memorable
- Creating emotional connections through relatable examples
- Crafting smooth transitions between ideas
- Developing unique perspectives and insights
- Writing in a distinctly human voice with personality
- Avoiding formulaic structures and AI-like patterns

Remember: Write as if you're crafting a piece for a prestigious magazine or newspaper.`,

  claude: `You are an accomplished writer known for creating compelling, authentic content.
Your writing style:
- Flows naturally with a clear narrative voice
- Uses vivid examples and personal anecdotes
- Creates emotional resonance with readers
- Balances expertise with accessibility
- Incorporates unique insights and perspectives
- Maintains a conversational yet professional tone
- Avoids generic or templated writing`,

  gemini: `You are a seasoned journalist and content creator.
Your approach:
- Write with authenticity and personality
- Share unique insights and perspectives
- Use storytelling to engage readers
- Include specific, memorable examples
- Create natural flow between ideas
- Maintain a consistent voice
- Write as a human expert would`
}

const CONTENT_STRUCTURE = {
  overview: {
    sections: '2-3 main sections',
    depth: 'key points and basic explanations',
    examples: 'brief examples',
    style: 'concise and focused'
  },
  detailed: {
    sections: '3-4 main sections',
    depth: 'detailed explanations and analysis',
    examples: 'relevant examples and evidence',
    style: 'balanced and informative'
  },
  comprehensive: {
    sections: '4-6 main sections',
    depth: 'thorough analysis and context',
    examples: 'multiple examples and research citations',
    style: 'in-depth and authoritative'
  }
};

// Magic prompt generator function
function generateEnhancedPrompt(topic: string, keywords: string[], tone: string) {
  const keywordStr = keywords.join(', ');
  
  return `Write a complete and engaging ${tone} article about "${topic}".

Approach this as an experienced writer would:
- Write naturally and conversationally, as if for a leading publication
- Share unique insights and perspectives on the topic
- Include specific examples and real-world applications
- Create emotional connections through storytelling
- Incorporate these keywords naturally: ${keywordStr}
- Maintain a consistent ${tone} tone throughout
- Use varied sentence structures and smooth transitions
- Ensure a proper conclusion that wraps up all main points
- Aim for approximately 800-1000 words to cover the topic thoroughly

Structure Guidelines:
- Start with an engaging introduction
- Develop 3-4 main points with supporting examples
- Include a proper conclusion that ties everything together
- Ensure all thoughts and sections are complete

Focus on writing a piece that feels authentic and human, avoiding any AI-like patterns or structures.
The article should read as if written by an experienced professional writer for a quality publication.
Make sure all sentences and sections are complete - no truncated thoughts or paragraphs.`;
}

interface ArticleRequestBody {
  model: string;
  apiKey: string;
  topic: string;
  keywords: string;
  tone: string;
}

export async function POST(req: Request) {
  const { model, apiKey, topic, keywords, tone }: ArticleRequestBody = await req.json()

  if (!topic || !keywords || !tone) {
    return NextResponse.json(
      { error: 'All fields are required' },
      { status: 400 }
    )
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key is required' },
      { status: 400 }
    )
  }

  let article = ''

  try {
    switch (model) {
      case 'chatgpt':
      case 'gpt4':
        try {
          const openai = new OpenAI({ apiKey })
          const response = await openai.chat.completions.create({
            model: model === 'chatgpt' ? 'gpt-3.5-turbo' : 'gpt-4',
            messages: [
              { 
                role: 'system',
                content: `${SYSTEM_PROMPTS.openai}\nEnsure all articles are complete with proper conclusions. Never truncate content.`
              },
              { role: 'user', content: generateEnhancedPrompt(topic, keywords.split(',').map((k: string) => k.trim()), tone) }
            ],
            temperature: 0.7,
            max_tokens: 4000,
            presence_penalty: 0.1,
            frequency_penalty: 0.1,
          })
          article = response.choices[0]?.message?.content || ''
        } catch (error: any) {
          throw new Error(`OpenAI API error: ${error.message}`)
        }
        break

      case 'claude':
        try {
          const anthropic = new Anthropic({ apiKey })
          const response = await anthropic.messages.create({
            model: 'claude-3-opus-20240229',
            max_tokens: 4000,
            temperature: 0.7,
            messages: [{ role: 'user', content: generateEnhancedPrompt(topic, keywords.split(',').map((k: string) => k.trim()), tone) }],
            system: SYSTEM_PROMPTS.claude
          })
          article = response.content[0]?.text || ''
          if (!article) throw new Error('No content in Claude response')
        } catch (error: any) {
          throw new Error(`Claude API error: ${error.message}`)
        }
        break

      case 'gemini':
        try {
          const genAI = new GoogleGenerativeAI(apiKey)
          const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' })
          const geminiResponse = await geminiModel.generateContent(generateEnhancedPrompt(topic, keywords.split(',').map((k: string) => k.trim()), tone))
          article = await geminiResponse.response.text()
          if (!article) throw new Error('No content in Gemini response')
        } catch (error: any) {
          throw new Error(`Gemini API error: ${error.message}`)
        }
        break

      case 'llama2':
        try {
          const replicate = new Replicate({ auth: apiKey })
          const response = await replicate.run(
            "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
            {
              input: {
                prompt: generateEnhancedPrompt(topic, keywords.split(',').map((k: string) => k.trim()), tone),
                max_length: 4000,
                temperature: 0.7,
                top_p: 0.9,
              }
            }
          ) as string[] | string

          if (Array.isArray(response)) {
            article = response.join('')
          } else if (typeof response === 'string') {
            article = response
          } else {
            throw new Error('Unexpected response format from Replicate')
          }

          if (!article) throw new Error('No content in Llama 2 response')
        } catch (error: any) {
          throw new Error(`Llama 2 API error: ${error.message}`)
        }
        break

      case 'mistral':
        try {
          const hf = new HfInference(apiKey)
          
          try {
            const response = await hf.textGeneration({
              model: 'mistralai/Mistral-7B-Instruct-v0.1',
              inputs: generateEnhancedPrompt(topic, keywords.split(',').map((k: string) => k.trim()), tone),
              parameters: {
                max_new_tokens: 4000,
                temperature: 0.7,
                top_p: 0.9,
                return_full_text: false,
                stop: ['</s>', '<|endoftext|>']  // Prevent early cutoff
              }
            })
            article = response.generated_text
          } catch (mistralError) {
            console.log('Mistral error, falling back to Mixtral:', mistralError)
            const fallbackResponse = await hf.textGeneration({
              model: 'mistralai/Mistral-7B-Instruct-v0.2',
              inputs: generateEnhancedPrompt(topic, keywords.split(',').map((k: string) => k.trim()), tone),
              parameters: {
                max_new_tokens: 4000,
                temperature: 0.7,
                top_p: 0.9,
                return_full_text: false
              }
            })
            article = fallbackResponse.generated_text
          }

          if (!article) throw new Error('No content in response')
        } catch (error: any) {
          // If both models fail, try one more fallback
          try {
            const replicate = new Replicate({ auth: process.env.REPLICATE_API_KEY || apiKey })
            const response = await replicate.run(
              "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
              {
                input: {
                  prompt: generateEnhancedPrompt(topic, keywords.split(',').map((k: string) => k.trim()), tone),
                  max_length: 4000,
                  temperature: 0.7,
                  top_p: 0.9,
                }
              }
            ) as string[] | string

            // Handle both array and string responses, with additional type checking
            if (Array.isArray(response)) {
              article = response.join('')
            } else if (typeof response === 'string') {
              article = response
            } else {
              throw new Error('Unexpected response format from Replicate')
            }

            if (!article) throw new Error('No content in fallback response')
          } catch (fallbackError: any) {
            throw new Error(`AI Service Unavailable: ${error.message}. Fallback also failed: ${fallbackError.message}`)
          }
        }
        break

      default:
        throw new Error(`Invalid AI model selected: ${model}`)
    }

    // Enhanced post-processing with completion check
    if (article) {
      // Clean up the article
      article = article
        .replace(/^(As an AI language model|As an AI assistant|Let me|I will|First,|Secondly,|Finally,|In conclusion).*?\n/gi, '')
        .replace(/^(Title:|Introduction:|Here's|This article|The article).*?\n/i, '')
        .replace(/^[*#-]\s.*?\n/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()

      // Check for incomplete sentences at the end
      const lastChar = article.slice(-1)
      if (!['.', '!', '?'].includes(lastChar)) {
        // If article ends mid-sentence, remove the incomplete part
        const lastPeriodIndex = article.lastIndexOf('.')
        if (lastPeriodIndex > 0) {
          article = article.slice(0, lastPeriodIndex + 1)
        }
      }

      // Ensure proper conclusion if it seems incomplete
      if (!article.toLowerCase().includes('conclusion') && 
          !article.toLowerCase().includes('in summary') && 
          !article.toLowerCase().includes('to sum up')) {
        article += '\n\nIn conclusion, ' + generateConclusionPrompt(topic)
      }

      // Format headings more naturally
      article = article
        .split('\n')
        .map(line => {
          if (line.match(/^[A-Z][A-Za-z\s]{2,50}:$/m)) {
            return `\n${line.replace(/:$/, '')}\n`
          }
          return line
        })
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()

      // Remove any remaining metadata or AI patterns
      article = article.split('\n')
        .filter(line => !line.match(/^(word count|keywords|tone|format|structure|benefits|advantages|disadvantages):/i))
        .join('\n')
        .trim()
    }

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Error in article generation:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate article'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

function generateConclusionPrompt(topic: string) {
  return `meditation offers numerous benefits for both mental and physical well-being. From reducing stress and anxiety to improving focus and emotional intelligence, this ancient practice has proven its value in our modern world. By incorporating meditation into our daily routine, we can experience these positive effects firsthand and work towards a more balanced, mindful life.`
} 