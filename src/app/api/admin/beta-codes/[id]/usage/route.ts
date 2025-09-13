import { NextRequest, NextResponse } from 'next/server'
import { kvDb } from '@/lib/kv-db'

// GET - Beta kod kullanım istatistikleri
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usages = await kvDb.betaCode.getUsageStats(params.id)
    return NextResponse.json({ usages })
  } catch (error) {
    console.error('Beta usage fetch error:', error)
    return NextResponse.json(
      { error: 'Kullanım istatistikleri alınamadı' },
      { status: 500 }
    )
  }
}
