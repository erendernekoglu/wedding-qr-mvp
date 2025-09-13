import { NextRequest, NextResponse } from 'next/server'
import { kvDb } from '@/lib/kv-db'

// GET - Beta kodları listele
export async function GET() {
  try {
    const betaCodes = await kvDb.betaCode.findMany()
    return NextResponse.json({ betaCodes })
  } catch (error) {
    console.error('Beta codes fetch error:', error)
    return NextResponse.json(
      { error: 'Beta kodları alınamadı' },
      { status: 500 }
    )
  }
}

// POST - Yeni beta kodu oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, description, maxUses, expiresAt } = body

    if (!code || !name) {
      return NextResponse.json(
        { error: 'Kod ve isim gerekli' },
        { status: 400 }
      )
    }

    // Kod zaten var mı kontrol et
    const existing = await kvDb.betaCode.findUnique({ code: code.toUpperCase() })
    if (existing) {
      return NextResponse.json(
        { error: 'Bu kod zaten kullanılıyor' },
        { status: 400 }
      )
    }

    const betaCode = await kvDb.betaCode.create({
      code: code.toUpperCase(),
      name,
      description,
      maxUses,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      isActive: true,
      createdBy: 'admin'
    })

    return NextResponse.json({ betaCode })
  } catch (error) {
    console.error('Beta code creation error:', error)
    return NextResponse.json(
      { error: 'Beta kodu oluşturulamadı' },
      { status: 500 }
    )
  }
}
