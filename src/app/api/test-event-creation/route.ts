import { NextRequest, NextResponse } from 'next/server'
import { kvDb } from '@/lib/kv-db'

export async function POST(request: NextRequest) {
  try {
    console.log('[TEST] Event creation test started')
    
    // Test verisi
    const testEvent = {
      code: 'TEST123',
      name: 'Test Etkinliği',
      description: 'Test açıklaması',
      maxFiles: 10,
      maxFileSize: 5,
      allowedTypes: ['jpg', 'png'],
      isActive: true,
      createdBy: 'test'
    }
    
    console.log('[TEST] Creating test event:', testEvent)
    
    const event = await kvDb.event.create(testEvent)
    
    console.log('[TEST] Event created successfully:', event)
    
    return NextResponse.json({ 
      success: true, 
      event,
      message: 'Test etkinliği başarıyla oluşturuldu'
    })
  } catch (error: any) {
    console.error('[TEST] Event creation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: error
      },
      { status: 500 }
    )
  }
}
