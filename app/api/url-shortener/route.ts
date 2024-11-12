import { NextResponse } from 'next/server'
import crypto from 'crypto'

// In-memory storage for URLs (in production, use a database)
const urlStorage = new Map<string, string>()

interface ShortenURLRequestBody {
  url: string;
}

export async function POST(req: Request) {
  try {
    const { url }: ShortenURLRequestBody = await req.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Generate a short code (6 characters)
    const shortCode = crypto.randomBytes(3).toString('hex')
    
    // Store the mapping
    urlStorage.set(shortCode, url)

    // Create the shortened URL (using the current domain)
    const shortenedUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/s/${shortCode}`

    return NextResponse.json({ 
      originalUrl: url,
      shortUrl: shortenedUrl,
      shortCode 
    })
  } catch (error) {
    console.error('Error in URL shortening:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to shorten URL'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// GET endpoint to retrieve original URL
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Short code is required' },
        { status: 400 }
      )
    }

    const originalUrl = urlStorage.get(code)

    if (!originalUrl) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ url: originalUrl })
  } catch (error) {
    console.error('Error retrieving URL:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve URL'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
} 