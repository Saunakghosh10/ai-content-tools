import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { HfInference } from '@huggingface/inference';
import Replicate from 'replicate';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface PlagiarismResult {
  originalityScore: number;
  similarityScore: number;
  sources: {
    url: string;
    title: string;
    matchedText: string;
    similarityPercentage: number;
  }[];
  detectedQuotes: {
    text: string;
    source?: string;
  }[];
  paraphrasedContent: {
    text: string;
    similarityScore: number;
    possibleSource?: string;
  }[];
}

async function checkWithOpenAI(content: string, apiKey: string): Promise<PlagiarismResult> {
  const openai = new OpenAI({ apiKey });

  // First, analyze the content for quotes and potential plagiarism
  const analysisCompletion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a plagiarism detection expert. Analyze the given text for potential plagiarism, quotes, and paraphrasing. Return the results in a structured format.'
      },
      {
        role: 'user',
        content: `Analyze this text for plagiarism, quotes, and paraphrasing:\n\n${content}`
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  // Then, search for potential sources
  const searchCompletion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a web search expert. For the given text, provide potential online sources where similar content might be found. Focus on academic and reputable sources.'
      },
      {
        role: 'user',
        content: `Find potential sources for this content:\n\n${content}`
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const analysis = JSON.parse(analysisCompletion.choices[0].message.content!);
  const sources = JSON.parse(searchCompletion.choices[0].message.content!);

  return {
    originalityScore: analysis.originalityScore,
    similarityScore: analysis.similarityScore,
    sources: sources.sources,
    detectedQuotes: analysis.quotes,
    paraphrasedContent: analysis.paraphrased
  };
}

async function checkWithGemini(content: string, apiKey: string): Promise<PlagiarismResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [{
        text: `Analyze this text for plagiarism and provide a detailed report. Format your response exactly like this example:
{
  "originalityScore": 85,
  "similarityScore": 15,
  "sources": [
    {
      "url": "example.com",
      "title": "Example Title",
      "matchedText": "matched text here",
      "similarityPercentage": 15
    }
  ],
  "quotes": [
    {
      "text": "quoted text here",
      "source": "source here"
    }
  ],
  "paraphrased": [
    {
      "text": "paraphrased text here",
      "similarityScore": 70,
      "possibleSource": "possible source here"
    }
  ]
}

Text to analyze:
${content}`
      }]
    }]
  });

  try {
    const response = JSON.parse(result.response.text().replace(/```json\n|\n```/g, ''));
    return {
      originalityScore: response.originalityScore,
      similarityScore: response.similarityScore,
      sources: response.sources || [],
      detectedQuotes: response.quotes || [],
      paraphrasedContent: response.paraphrased || []
    };
  } catch (error) {
    // Fallback response if parsing fails
    return {
      originalityScore: 100,
      similarityScore: 0,
      sources: [],
      detectedQuotes: [],
      paraphrasedContent: []
    };
  }
}

async function checkWithAnthropic(content: string, apiKey: string): Promise<PlagiarismResult> {
  const anthropic = new Anthropic({ apiKey });
  
  const completion = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1000,
    temperature: 0.2,
    system: "You are a plagiarism detection expert. Analyze the given text and provide a detailed report in JSON format.",
    messages: [
      {
        role: 'user',
        content: `Analyze this text for plagiarism and provide a detailed report including originality score, similarity score, potential sources, quotes, and paraphrased content. Format the response as JSON.\n\nText to analyze:\n${content}`
      }
    ]
  });

  const response = JSON.parse(completion.content[0].text);

  return {
    originalityScore: response.originalityScore,
    similarityScore: response.similarityScore,
    sources: response.sources,
    detectedQuotes: response.quotes,
    paraphrasedContent: response.paraphrased
  };
}

async function checkWithReplicate(content: string, apiKey: string): Promise<PlagiarismResult> {
  const replicate = new Replicate({ auth: apiKey });
  
  const output = await replicate.run(
    "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
    {
      input: {
        prompt: `Analyze this text for plagiarism and provide a detailed report including originality score, similarity score, potential sources, quotes, and paraphrased content. Format the response as JSON.\n\nText to analyze:\n${content}`,
        temperature: 0.2,
        max_new_tokens: 1000,
        system_prompt: "You are a plagiarism detection expert. Analyze the given text and provide a detailed report in JSON format."
      }
    }
  );

  const response = typeof output === 'string' ? JSON.parse(output) : output;

  return {
    originalityScore: response.originalityScore,
    similarityScore: response.similarityScore,
    sources: response.sources,
    detectedQuotes: response.quotes,
    paraphrasedContent: response.paraphrased
  };
}

async function checkWithHuggingFace(content: string, apiKey: string): Promise<PlagiarismResult> {
  const hf = new HfInference(apiKey);
  
  const response = await hf.textGeneration({
    model: 'mistralai/Mistral-7B-Instruct-v0.2',
    inputs: `Analyze this text for plagiarism and provide a detailed report including originality score, similarity score, potential sources, quotes, and paraphrased content. Format the response as JSON.\n\nText to analyze:\n${content}`,
    parameters: {
      temperature: 0.2,
      max_new_tokens: 1000,
      return_full_text: false
    }
  });

  const result = JSON.parse(response.generated_text);

  return {
    originalityScore: result.originalityScore,
    similarityScore: result.similarityScore,
    sources: result.sources,
    detectedQuotes: result.quotes,
    paraphrasedContent: result.paraphrased
  };
}

export async function POST(req: Request) {
  try {
    const { content, model, apiKey } = await req.json();

    let result: PlagiarismResult;

    switch (model) {
      case 'gpt4':
        result = await checkWithOpenAI(content, apiKey);
        break;
      case 'claude':
        result = await checkWithAnthropic(content, apiKey);
        break;
      case 'gemini':
        result = await checkWithGemini(content, apiKey);
        break;
      case 'llama2':
        result = await checkWithReplicate(content, apiKey);
        break;
      case 'mistral':
        result = await checkWithHuggingFace(content, apiKey);
        break;
      default:
        throw new Error('Invalid model selected');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Plagiarism check error:', error);
    return NextResponse.json(
      { error: 'Failed to check plagiarism' },
      { status: 500 }
    );
  }
} 