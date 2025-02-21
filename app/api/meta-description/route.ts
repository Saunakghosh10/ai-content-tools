import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { HfInference } from '@huggingface/inference';
import Replicate from 'replicate';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function generateWithOpenAI(prompt: string, apiKey: string, model: string = 'gpt-3.5-turbo') {
  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are an SEO expert specializing in writing meta descriptions that rank well in search engines while maintaining readability and engagement."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    model: model === 'gpt4' ? 'gpt-4' : 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 200,
  });

  return completion.choices[0].message.content?.split('\n').filter(desc => desc.trim() !== '') || [];
}

async function generateWithGemini(prompt: string, apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 200,
    },
  });

  const response = result.response;
  const text = response.text();
  return text.split('\n').filter(desc => desc.trim() !== '');
}

async function generateWithAnthropic(prompt: string, apiKey: string) {
  const anthropic = new Anthropic({ apiKey });
  const completion = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 200,
    temperature: 0.7,
    system: "You are an SEO expert specializing in writing meta descriptions that rank well in search engines while maintaining readability and engagement.",
    messages: [{ role: 'user', content: prompt }],
  });

  return completion.content[0].text.split('\n').filter(desc => desc.trim() !== '');
}

async function generateWithReplicate(prompt: string, apiKey: string) {
  const replicate = new Replicate({ auth: apiKey });
  const output = await replicate.run(
    "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
    {
      input: {
        prompt: `${prompt}\n\nRemember to return exactly 3 descriptions, one per line.`,
        temperature: 0.7,
        max_new_tokens: 200,
        system_prompt: "You are an SEO expert specializing in writing meta descriptions that rank well in search engines while maintaining readability and engagement."
      }
    }
  );

  // Replicate returns an array of strings or a single string
  let descriptions: string[] = [];
  
  if (Array.isArray(output)) {
    // If output is an array, join it and split by newlines
    descriptions = output.join(' ').split('\n');
  } else if (typeof output === 'string') {
    // If output is a string, split by newlines
    descriptions = output.split('\n');
  }

  // Filter empty lines and ensure we have exactly 3 descriptions
  descriptions = descriptions
    .map(desc => desc.trim())
    .filter(desc => desc && !desc.startsWith('1.') && !desc.startsWith('2.') && !desc.startsWith('3.'))
    .slice(0, 3);

  // If we don't have enough descriptions, add generic ones
  while (descriptions.length < 3) {
    descriptions.push("Discover our comprehensive solutions and expert services. Learn more about how we can help you achieve your goals today.");
  }

  return descriptions;
}

async function generateWithHuggingFace(prompt: string, apiKey: string) {
  const hf = new HfInference(apiKey);
  const response = await hf.textGeneration({
    model: 'mistralai/Mistral-7B-Instruct-v0.2',
    inputs: `${prompt}\n\nRemember to return exactly 3 descriptions, one per line.`,
    parameters: {
      temperature: 0.7,
      max_new_tokens: 200,
      return_full_text: false
    }
  });

  let descriptions = response.generated_text
    .split('\n')
    .map(desc => desc.trim())
    .filter(desc => desc && !desc.startsWith('1.') && !desc.startsWith('2.') && !desc.startsWith('3.'))
    .slice(0, 3);

  // If we don't have enough descriptions, add generic ones
  while (descriptions.length < 3) {
    descriptions.push("Discover our comprehensive solutions and expert services. Learn more about how we can help you achieve your goals today.");
  }

  return descriptions;
}

export async function POST(req: Request) {
  try {
    const { title, keywords, content, model, apiKey } = await req.json();

    const prompt = `Generate 3 unique, SEO-optimized meta descriptions for a webpage with the following details:

Title: ${title}
Keywords: ${keywords}
Content: ${content}

Requirements:
1. Each description should be between 120-160 characters
2. Include the most important keywords naturally
3. Be compelling and action-oriented
4. Be unique and accurately represent the page content
5. Avoid keyword stuffing
6. Use active voice
7. Include a call-to-action when appropriate

Format: Return only the 3 descriptions, one per line, without any additional text or numbering.`;

    let descriptions: string[] = [];

    switch (model) {
      case 'gpt3.5':
      case 'gpt4':
        descriptions = await generateWithOpenAI(prompt, apiKey, model);
        break;
      case 'claude':
        descriptions = await generateWithAnthropic(prompt, apiKey);
        break;
      case 'llama2':
        descriptions = await generateWithReplicate(prompt, apiKey);
        break;
      case 'mistral':
        descriptions = await generateWithHuggingFace(prompt, apiKey);
        break;
      case 'gemini':
        descriptions = await generateWithGemini(prompt, apiKey);
        break;
      default:
        throw new Error('Invalid model selected');
    }

    // Ensure we always return exactly 3 descriptions
    descriptions = descriptions.slice(0, 3);
    while (descriptions.length < 3) {
      descriptions.push("Discover our comprehensive solutions and expert services. Learn more about how we can help you achieve your goals today.");
    }

    return NextResponse.json({ descriptions });
  } catch (error) {
    console.error('Meta description generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate meta descriptions' },
      { status: 500 }
    );
  }
} 