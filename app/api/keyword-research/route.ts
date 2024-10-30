import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Anthropic } from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Replicate from 'replicate'
import { HfInference } from '@huggingface/inference'

export async function POST(req: Request) {
  const { model, apiKey, niche } = await req.json()

  if (!niche || typeof niche !== 'string') {
    return NextResponse.json(
      { error: 'Invalid niche parameter' },
      { status: 400 }
    );
  }

  if (!apiKey || typeof apiKey !== 'string') {
    return NextResponse.json(
      { error: 'API key is required' },
      { status: 400 }
    );
  }

  let keywords = []

  try {
    switch (model) {
      case 'chatgpt':
      case 'gpt4':
        try {
          const openai = new OpenAI({ apiKey })
          const openaiResponse = await openai.chat.completions.create({
            model: model === 'chatgpt' ? 'gpt-3.5-turbo' : 'gpt-4',
            messages: [{ 
              role: 'system',
              content: 'You are a keyword research expert. Always respond with a JSON object containing an array of keywords. Each keyword should have a "keyword" and "category" property.'
            },
            { 
              role: 'user', 
              content: `Generate 10 low-competition, long-tail keywords for the niche: ${niche}. Return ONLY a JSON object with a 'keywords' array containing objects with 'keyword' and 'category' properties.` 
            }],
            response_format: { type: "json_object" }
          })
          const content = openaiResponse.choices[0]?.message?.content
          if (!content) throw new Error('No content in OpenAI response')
          const parsedContent = JSON.parse(content)
          if (!parsedContent.keywords || !Array.isArray(parsedContent.keywords)) {
            throw new Error('Invalid response format from OpenAI')
          }
          keywords = parsedContent.keywords
        } catch (error: any) {
          throw new Error(`OpenAI API error: ${error.message}`)
        }
        break

      case 'claude':
        try {
          const anthropic = new Anthropic({ apiKey })
          const claudeResponse = await anthropic.messages.create({
            model: 'claude-3-opus-20240229',
            max_tokens: 1000,
            messages: [{
              role: 'user',
              content: `Generate 10 low-competition, long-tail keywords for the niche: ${niche}. Return ONLY a JSON object with a 'keywords' array containing objects with 'keyword' and 'category' properties.`
            }],
            system: "You are a keyword research expert. Always respond with a JSON object containing an array of keywords. Each keyword should have a 'keyword' and 'category' property."
          })
          const content = claudeResponse.content[0]?.text
          if (!content) throw new Error('No content in Claude response')
          const parsedContent = JSON.parse(content)
          if (!parsedContent.keywords || !Array.isArray(parsedContent.keywords)) {
            throw new Error('Invalid response format from Claude')
          }
          keywords = parsedContent.keywords
        } catch (error: any) {
          throw new Error(`Claude API error: ${error.message}`)
        }
        break

      case 'gemini':
        try {
          const genAI = new GoogleGenerativeAI(apiKey)
          const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' })
          const prompt = `Generate 10 low-competition, long-tail keywords for the niche: ${niche}. Return ONLY a JSON object with a 'keywords' array containing objects with 'keyword' and 'category' properties.`
          const geminiResponse = await geminiModel.generateContent(prompt)
          const content = await geminiResponse.response.text()
          if (!content) throw new Error('No content in Gemini response')
          const parsedContent = JSON.parse(content)
          if (!parsedContent.keywords || !Array.isArray(parsedContent.keywords)) {
            throw new Error('Invalid response format from Gemini')
          }
          keywords = parsedContent.keywords
        } catch (error: any) {
          throw new Error(`Gemini API error: ${error.message}`)
        }
        break

      case 'llama2':
        try {
          const replicate = new Replicate({ auth: apiKey })
          const model_version = 'meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3'
          
          const prompt = `Generate 10 low-competition, long-tail keywords for the niche: ${niche}.
Return ONLY a JSON object in this exact format:
{
  "keywords": [
    {"keyword": "example keyword 1", "category": "Category 1"},
    {"keyword": "example keyword 2", "category": "Category 2"}
  ]
}`
          
          const replicateResponse = await replicate.run(model_version, {
            input: {
              prompt,
              max_tokens: 2000,
              temperature: 0.3,
              system_prompt: "You are a JSON generator that ONLY outputs valid JSON objects with no additional text.",
              top_p: 0.95,
              repetition_penalty: 1.1
            }
          }) as string[] | string

          if (!replicateResponse) throw new Error('No response from Replicate')
          
          let parsedContent: { keywords: Array<{ keyword: string, category: string }> }

          if (Array.isArray(replicateResponse)) {
            // Join array elements and parse as JSON
            const jsonStr = replicateResponse.join('').trim()
            try {
              parsedContent = JSON.parse(jsonStr)
            } catch (e) {
              console.error('Failed to parse joined response:', e)
              throw new Error('Invalid JSON format in response')
            }
          } else {
            try {
              parsedContent = JSON.parse(replicateResponse)
            } catch (e) {
              console.error('Failed to parse string response:', e)
              throw new Error('Invalid JSON format in response')
            }
          }

          if (!parsedContent?.keywords || !Array.isArray(parsedContent.keywords)) {
            throw new Error('Invalid response structure')
          }

          // Clean and normalize the keywords
          keywords = parsedContent.keywords.map(k => ({
            keyword: k.keyword.trim(),
            category: k.category.trim()
          })).filter(k => k.keyword && k.category)

          if (keywords.length === 0) {
            throw new Error('No valid keywords found in response')
          }

        } catch (error: any) {
          console.error('Replicate error details:', error)
          if (error.response?.status === 401) {
            throw new Error('Invalid Replicate API key')
          }
          throw new Error(`Replicate API error: ${error.message}`)
        }
        break

      case 'falcon':
        try {
          const hf = new HfInference(apiKey)
          const response = await hf.textGeneration({
            model: 'mistralai/Mistral-7B-Instruct-v0.2',
            inputs: `Generate 10 low-competition, long-tail keywords for the niche: ${niche}. Format the response as a JSON object with a 'keywords' array containing objects with 'keyword' and 'category' properties.`,
            parameters: {
              max_new_tokens: 2000,
              temperature: 0.3,
              top_p: 0.95,
              repetition_penalty: 1.1,
              return_full_text: false
            }
          })

          if (!response.generated_text) {
            throw new Error('No response from Hugging Face')
          }

          // Try to extract JSON from the response
          const jsonMatch = response.generated_text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('No valid JSON found in response')
          }

          const parsedContent = JSON.parse(jsonMatch[0])
          if (!parsedContent.keywords || !Array.isArray(parsedContent.keywords)) {
            throw new Error('Invalid response format from Hugging Face')
          }

          keywords = parsedContent.keywords.map((k: { keyword: string; category: string }) => ({
            keyword: k.keyword.trim(),
            category: k.category.trim()
          })).filter((k: { keyword: any; category: any }) => k.keyword && k.category)

          if (keywords.length === 0) {
            throw new Error('No valid keywords found in response')
          }

        } catch (error: any) {
          console.error('Hugging Face error details:', error)
          if (error.response?.status === 401) {
            throw new Error('Invalid Hugging Face API key')
          }
          throw new Error(`Hugging Face API error: ${error.message}`)
        }
        break

      default:
        throw new Error(`Invalid AI model selected: ${model}`)
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      throw new Error('No keywords generated')
    }

    // Validate keyword format
    const validKeywords = keywords.every(k => 
      k && typeof k === 'object' && 
      'keyword' in k && typeof k.keyword === 'string' &&
      'category' in k && typeof k.category === 'string'
    )

    if (!validKeywords) {
      throw new Error('Invalid keyword format in response')
    }

    return NextResponse.json({ keywords })
  } catch (error) {
    console.error('Error in keyword research:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to perform keyword research'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
