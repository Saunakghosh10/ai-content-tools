import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code

  try {
    // Fetch the original URL from our API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/url-shortener?code=${code}`)
    const data = await response.json()

    if (data.error) {
      return new Response('URL not found', { status: 404 })
    }

    // Redirect to the original URL
    return NextResponse.redirect(data.url)
  } catch (error) {
    console.error('Error redirecting:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
} 