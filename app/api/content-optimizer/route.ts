import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Anthropic } from '@anthropic-ai/sdk'
import Replicate from 'replicate'
import { HfInference } from '@huggingface/inference'

const SYSTEM_PROMPT = `You are an expert content optimizer specializing in SEO and readability.
Your task is to analyze content and provide:
1. A readability score (0-100)
2. An SEO score (0-100)
3. Specific improvement suggestions
4. Optimized version of the content

Focus on:
- Clarity and readability
- Keyword optimization and placement
- Content structure and flow
- Meta description optimization
- Header tag usage
- Content length and depth

Always return a JSON response with:
{
  "readabilityScore": number,
  "seoScore": number,
  "suggestions": string[],
  "optimizedContent": string
}`

interface OptimizeRequestBody {
  model: string;
  apiKey: string;
  content: string;
  targetKeywords: string;
}

export async function POST(req: Request) {
  const { model, apiKey, content, targetKeywords }: OptimizeRequestBody = await req.json()

  if (!content || !targetKeywords) {
    return NextResponse.json(
      { error: 'Content and target keywords are required' },
      { status: 400 }
    )
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key is required' },
      { status: 400 }
    )
  }

  try {
    let result;

    switch (model) {
      case 'chatgpt':
      case 'gpt4':
        try {
          const openai = new OpenAI({ apiKey })
          const response = await openai.chat.completions.create({
            model: model === 'chatgpt' ? 'gpt-3.5-turbo' : 'gpt-4',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { 
                role: 'user',
                content: `Content: ${content}\n\nTarget Keywords: ${targetKeywords}`
              }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
          })
          result = JSON.parse(response.choices[0]?.message?.content || '{}')
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
            system: SYSTEM_PROMPT,
            messages: [{
              role: 'user',
              content: `Content: ${content}\n\nTarget Keywords: ${targetKeywords}`
            }]
          })
          result = JSON.parse(response.content[0]?.text || '{}')
        } catch (error: any) {
          throw new Error(`Claude API error: ${error.message}`)
        }
        break

      case 'llama2':
        try {
          const replicate = new Replicate({ auth: apiKey })
          const systemInstruction = `You are a JSON generator that ONLY outputs valid JSON objects.
Your response must be a complete, valid JSON object with this exact structure:
{
  "readabilityScore": (number between 0-100),
  "seoScore": (number between 0-100),
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "optimizedContent": "content here"
}
Important: Keep the content concise and complete. Do not exceed 2000 characters in the optimizedContent.`

          const response = await replicate.run(
            "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
            {
              input: {
                prompt: `${systemInstruction}\n\nContent to optimize: ${content}\n\nTarget Keywords: ${targetKeywords}\n\nAnalyze the content and return ONLY a JSON object. Keep the optimizedContent complete and under 2000 characters.`,
                max_length: 2500,
                temperature: 0.7,
                top_p: 0.9,
                system_prompt: systemInstruction
              }
            }
          ) as string[] | string

          // Clean and prepare the response text
          let responseText = Array.isArray(response) ? response.join('') : response
          
          // Log the raw response for debugging
          console.log('Raw Llama2 response:', responseText)
          
          // Pre-process the response text
          responseText = responseText
            .replace(/^[^{]*/, '') // Remove any text before the first {
            .replace(/}[^}]*$/, '}') // Remove any text after the last }
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
            .trim()

          // Extract the content field for special handling
          const contentMatch = responseText.match(/"optimizedContent"\s*:\s*"([^]*?)(?="\s*[,}])/);
          if (contentMatch) {
            let content = contentMatch[1]
              .replace(/\\/g, '\\\\') // Escape backslashes first
              .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
              .replace(/(?<!\\)"/g, '\\"') // Escape unescaped quotes
              .replace(/\r?\n/g, '\\n') // Convert newlines to \n
              .replace(/\t/g, '\\t') // Convert tabs
              .replace(/[\u2018\u2019]/g, "'") // Convert smart quotes
              .replace(/[\u201C\u201D]/g, '\\"') // Convert smart double quotes
              .replace(/…/g, '...') // Convert ellipsis
              .replace(/—/g, '-') // Convert em dashes
              .replace(/[^\x20-\x7E\\n\\t]/g, '') // Remove non-printable chars except \n and \t

            // Find the last complete sentence
            const sentences = content.split(/(?<=[.!?])\s+/);
            if (sentences.length > 1) {
              content = sentences.slice(0, -1).join(' ').trim();
              if (!content.match(/[.!?]$/)) {
                content += '.'
              }
            }

            // Replace the original content with cleaned content
            responseText = responseText.replace(
              /"optimizedContent"\s*:\s*"[^]*?(?="\s*[,}])/,
              `"optimizedContent":"${content}`
            )
          }

          try {
            // First attempt: direct parse
            result = JSON.parse(responseText)
          } catch (firstError) {
            try {
              // Second attempt: with additional cleaning
              const cleanJson = responseText
                .replace(/,\s*([\]}])/g, '$1') // Remove trailing commas
                .replace(/([{\[,])\s*,/g, '$1') // Remove leading commas
                .replace(/\s+(?=\w+":)/g, ' ') // Clean whitespace before keys
                .replace(/}\s*{/g, '},{') // Fix multiple objects
                .replace(/"\s*}/g, '"}') // Fix ending quotes
                .replace(/\[\s*]/g, '[]') // Fix empty arrays
                .replace(/"\s*,/g, '",') // Fix spaces after quotes
                .replace(/,\s*"/g, ',"') // Fix spaces before quotes

              result = JSON.parse(cleanJson)
            } catch (secondError) {
              console.error('First parse error:', firstError)
              console.error('Second parse error:', secondError)
              console.error('Cleaned JSON attempt:', responseText)
              throw new Error('Failed to parse response into valid JSON')
            }
          }

          // Validate the result structure
          if (
            !result ||
            typeof result.readabilityScore !== 'number' ||
            typeof result.seoScore !== 'number' ||
            !Array.isArray(result.suggestions) ||
            typeof result.optimizedContent !== 'string' ||
            !result.optimizedContent.trim()
          ) {
            throw new Error('Invalid response structure from Llama2')
          }

          // Final cleanup of the optimized content
          result.optimizedContent = result.optimizedContent
            .replace(/\\n/g, '\n') // Convert escaped newlines back
            .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
            .replace(/\s+\./g, '.') // Fix spacing before periods
            .trim()

        } catch (error: any) {
          console.error('Llama2 error details:', error)
          throw new Error(`Llama 2 API error: ${error.message}`)
        }
        break

      case 'mistral':
        try {
          const hf = new HfInference(apiKey)
          const systemInstruction = "You are a JSON generator that ONLY outputs valid JSON objects with no additional text. Format your response as a valid JSON object with readabilityScore (number), seoScore (number), suggestions (array of strings), and optimizedContent (string)."
          
          const response = await hf.textGeneration({
            model: "mistralai/Mistral-7B-Instruct-v0.2",
            inputs: `${systemInstruction}\n\nContent: ${content}\n\nTarget Keywords: ${targetKeywords}\n\nAnalyze the content and return ONLY a JSON object following this exact structure:\n{
              "readabilityScore": number between 0-100,
              "seoScore": number between 0-100,
              "suggestions": ["suggestion1", "suggestion2", ...],
              "optimizedContent": "the optimized content as a string"
            }\n\nDo not include any additional text or formatting outside the JSON object.`,
            parameters: {
              max_new_tokens: 4000,
              temperature: 0.7,
              top_p: 0.9,
              return_full_text: false
            }
          })

          if (!response.generated_text) {
            throw new Error('No content in Mistral response')
          }

          // Clean and prepare the response text
          let responseText = response.generated_text
          
          // Log the raw response for debugging
          console.log('Raw Mistral response:', responseText)
          
          // Pre-process the response text
          responseText = responseText
            .replace(/^[^{]*/, '') // Remove any text before the first {
            .replace(/}[^}]*$/, '}') // Remove any text after the last }
            .replace(/\n\s*"/g, '"') // Remove newlines before quotes
            .replace(/"\n\s*/g, '"') // Remove newlines after quotes
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim()

          try {
            // First attempt: direct parse
            result = JSON.parse(responseText)
          } catch (firstError) {
            try {
              // Second attempt: with additional cleaning
              const cleanJson = responseText
                .replace(/[\u0000-\u001F]+/g, '') // Remove control characters
                .replace(/\\(?!["\\/bfnrtu])/g, '\\\\') // Fix unescaped backslashes
                .replace(/([^\\])"/g, '$1\\"') // Escape unescaped quotes
                .replace(/^\\"/, '"') // Fix start quote if escaped
                .replace(/\\"$/, '"') // Fix end quote if escaped
                .replace(/\n/g, '\\n') // Handle newlines
                .replace(/\r/g, '\\r') // Handle carriage returns
                .replace(/\t/g, '\\t') // Handle tabs
                .replace(/\\+"/g, '\\"') // Fix multiple escapes before quotes
                .replace(/"{/g, '{') // Remove quotes around objects
                .replace(/}"/g, '}') // Remove quotes around objects
                .replace(/"\[/g, '[') // Remove quotes around arrays
                .replace(/\]"/g, ']') // Remove quotes around arrays
                .replace(/,\s*([\]}])/g, '$1') // Remove trailing commas
                .replace(/([{\[,])\s*,/g, '$1') // Remove leading commas
                .replace(/-(?=\d)/g, '') // Remove standalone minus signs before numbers

              result = JSON.parse(cleanJson)
            } catch (secondError) {
              console.error('First parse error:', firstError)
              console.error('Second parse error:', secondError)
              console.error('Cleaned JSON attempt:', responseText)
              throw new Error('Failed to parse response into valid JSON')
            }
          }

          // Validate the result structure
          if (
            !result ||
            typeof result.readabilityScore !== 'number' ||
            typeof result.seoScore !== 'number' ||
            !Array.isArray(result.suggestions) ||
            typeof result.optimizedContent !== 'string'
          ) {
            throw new Error('Invalid response structure from Mistral')
          }

        } catch (error: any) {
          console.error('Mistral error details:', error)
          throw new Error(`Mistral API error: ${error.message}`)
        }
        break

      default:
        throw new Error(`Invalid AI model selected: ${model}`)
    }

    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response format from AI service')
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in content optimization:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to optimize content'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
} 