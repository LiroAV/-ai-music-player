import { NextRequest, NextResponse } from 'next/server'

// Next.js API route that proxies onboarding to the NestJS backend
// In production this would carry the Supabase auth token from cookies
export async function POST(req: NextRequest) {
  const body = await req.json()
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

  const res = await fetch(`${apiUrl}/api/profile/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: res.status })
  }

  return NextResponse.json(await res.json())
}
