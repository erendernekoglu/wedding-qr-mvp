import { NextRequest, NextResponse } from 'next/server'
import { kvDb } from '@/lib/kv-db'

// PATCH - Etkinlik güncelle
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const data = await req.json()
    const updatedEvent = await kvDb.event.update(id, data)
    
    if (!updatedEvent) {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json({ event: updatedEvent })
  } catch (error) {
    console.error('Event update error:', error)
    return NextResponse.json({ error: 'Etkinlik güncellenemedi' }, { status: 500 })
  }
}

// DELETE - Etkinlik sil
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const deleted = await kvDb.event.delete(id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 })
    }
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Event delete error:', error)
    return NextResponse.json({ error: 'Etkinlik silinemedi' }, { status: 500 })
  }
}
