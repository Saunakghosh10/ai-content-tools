import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');

export async function POST(req: Request) {
  try {
    const { text, sourceLang, targetLang } = await req.json();

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the language names instead of codes for better prompting
    const languages = new Intl.DisplayNames(['en'], { type: 'language' });
    const sourceLanguage = languages.of(sourceLang);
    const targetLanguage = languages.of(targetLang);

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create the prompt
    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Provide only the translated text without any additional explanations or notes:

${text}`;

    // Generate the translation
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
