import { NextRequest, NextResponse } from 'next/server'
import { kvDb } from '@/lib/kv-db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string; tableId: string } }
) {
  try {
    const { eventId, tableId } = params
    const body = await request.json()

    // Mevcut masaları getir
    const tablesData = await kvDb.redis.get(`event:${eventId}:tables`)
    if (!tablesData) {
      return NextResponse.json({
        success: false,
        error: 'Masa bulunamadı'
      }, { status: 404 })
    }

    const tables = JSON.parse(tablesData)
    const tableIndex = tables.findIndex((table: any) => table.id === tableId)
    
    if (tableIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Masa bulunamadı'
      }, { status: 404 })
    }

    // Masa adını güncelle
    tables[tableIndex] = {
      ...tables[tableIndex],
      name: body.name || tables[tableIndex].name,
      updatedAt: new Date().toISOString()
    }

    // Güncellenmiş masa listesini kaydet
    await kvDb.redis.set(`event:${eventId}:tables`, JSON.stringify(tables))

    return NextResponse.json({
      success: true,
      data: {
        table: tables[tableIndex]
      }
    })
  } catch (error) {
    console.error('Update table error:', error)
    return NextResponse.json({
      success: false,
      error: 'Masa güncellenirken hata oluştu'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string; tableId: string } }
) {
  try {
    const { eventId, tableId } = params

    // Mevcut masaları getir
    const tablesData = await kvDb.redis.get(`event:${eventId}:tables`)
    if (!tablesData) {
      return NextResponse.json({
        success: false,
        error: 'Masa bulunamadı'
      }, { status: 404 })
    }

    const tables = JSON.parse(tablesData)
    const updatedTables = tables.filter((table: any) => table.id !== tableId)

    // Güncellenmiş masa listesini kaydet
    await kvDb.redis.set(`event:${eventId}:tables`, JSON.stringify(updatedTables))

    return NextResponse.json({
      success: true,
      data: {
        message: 'Masa başarıyla silindi'
      }
    })
  } catch (error) {
    console.error('Delete table error:', error)
    return NextResponse.json({
      success: false,
      error: 'Masa silinirken hata oluştu'
    }, { status: 500 })
  }
}
