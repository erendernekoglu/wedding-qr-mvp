import { NextRequest, NextResponse } from 'next/server'
import { kvDb } from '@/lib/kv-db'

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params

    // Etkinlik bilgilerini getir
    const eventData = await kvDb.redis.get(`event:${eventId}`)
    if (!eventData) {
      return NextResponse.json({
        success: false,
        error: 'Etkinlik bulunamadı'
      }, { status: 404 })
    }

    const event = JSON.parse(eventData)

    // Masa bilgilerini getir
    const tablesData = await kvDb.redis.get(`event:${eventId}:tables`)
    const tables = tablesData ? JSON.parse(tablesData) : []

    return NextResponse.json({
      success: true,
      data: {
        event,
        tables
      }
    })
  } catch (error) {
    console.error('Event detail fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Etkinlik bilgileri alınırken hata oluştu'
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const body = await request.json()

    // Etkinlik bilgilerini getir
    const eventData = await kvDb.redis.get(`event:${eventId}`)
    if (!eventData) {
      return NextResponse.json({
        success: false,
        error: 'Etkinlik bulunamadı'
      }, { status: 404 })
    }

    const event = JSON.parse(eventData)

    // Etkinlik bilgilerini güncelle
    const updatedEvent = {
      ...event,
      name: body.name || event.name,
      description: body.description || event.description,
      eventDate: body.eventDate || event.eventDate,
      eventTime: body.eventTime || event.eventTime,
      location: body.location || event.location,
      customMessage: body.customMessage || event.customMessage,
      maxFiles: body.maxFiles || event.maxFiles,
      tableCount: body.tableCount || event.tableCount,
      updatedAt: new Date().toISOString()
    }

    // Güncellenmiş etkinliği kaydet
    await kvDb.redis.set(`event:${eventId}`, JSON.stringify(updatedEvent))

    return NextResponse.json({
      success: true,
      data: {
        event: updatedEvent
      }
    })
  } catch (error) {
    console.error('Event update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Etkinlik güncellenirken hata oluştu'
    }, { status: 500 })
  }
}
