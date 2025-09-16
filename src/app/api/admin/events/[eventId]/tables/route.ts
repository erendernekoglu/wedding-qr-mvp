import { NextRequest, NextResponse } from 'next/server'
import { kvDb } from '@/lib/kv-db'

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params

    // Etkinlik bilgilerini kontrol et
    const eventData = await kvDb.redis.get(`event:${eventId}`)
    if (!eventData) {
      return NextResponse.json({
        success: false,
        error: 'Etkinlik bulunamadı'
      }, { status: 404 })
    }

    // Mevcut masaları getir
    const tablesData = await kvDb.redis.get(`event:${eventId}:tables`)
    const tables = tablesData ? JSON.parse(tablesData) : []

    // Yeni masa oluştur
    const newTable = {
      id: `table_${Date.now()}`,
      name: `Masa ${tables.length + 1}`,
      qrCode: `${eventId}_table_${tables.length + 1}`,
      photoCount: 0,
      createdAt: new Date().toISOString()
    }

    // Masayı listeye ekle
    const updatedTables = [...tables, newTable]

    // Güncellenmiş masa listesini kaydet
    await kvDb.redis.set(`event:${eventId}:tables`, JSON.stringify(updatedTables))

    return NextResponse.json({
      success: true,
      data: {
        table: newTable
      }
    })
  } catch (error) {
    console.error('Add table error:', error)
    return NextResponse.json({
      success: false,
      error: 'Masa eklenirken hata oluştu'
    }, { status: 500 })
  }
}
