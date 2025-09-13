import { NextRequest, NextResponse } from 'next/server'
import { kvDb } from '@/lib/kv-db'

// GET - Etkinlik kullanım istatistikleri
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const usages = await kvDb.event.getUsageStats(id)
    return NextResponse.json({ usages })
  } catch (error) {
    console.error('Event usage fetch error:', error)
    return NextResponse.json({ error: 'Kullanım istatistikleri alınamadı' }, { status: 500 })
  }
}
