import { NextRequest, NextResponse } from 'next/server'
import { validateEventCode } from '@/lib/event-validation'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    
    if (!code) {
      return NextResponse.json(
        { error: 'Etkinlik kodu gerekli' },
        { status: 400 }
      )
    }
    
    const result = await validateEventCode(code)
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Event code validation error:', error)
    return NextResponse.json(
      { 
        valid: false, 
        error: error.message 
      },
      { status: 500 }
    )
  }
}
