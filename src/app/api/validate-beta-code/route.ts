import { NextRequest, NextResponse } from 'next/server'
import { validateBetaCode } from '@/lib/beta-users'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    
    if (!code) {
      return NextResponse.json(
        { error: 'Beta kodu gerekli' },
        { status: 400 }
      )
    }
    
    const result = await validateBetaCode(code)
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Beta code validation error:', error)
    return NextResponse.json(
      { 
        valid: false, 
        error: error.message 
      },
      { status: 500 }
    )
  }
}
