import { NextRequest, NextResponse } from 'next/server'
import { kvDb } from '@/lib/kv-db'

// GET - Etkinlikleri listele
export async function GET() {
  try {
    const events = await kvDb.event.findMany()
    return NextResponse.json({ events })
  } catch (error) {
    console.error('Events fetch error:', error)
    return NextResponse.json(
      { error: 'Etkinlikler alınamadı' },
      { status: 500 }
    )
  }
}

// POST - Yeni etkinlik oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, description, maxFiles, maxFileSize, allowedTypes, expiresAt } = body

    if (!code || !name) {
      return NextResponse.json(
        { error: 'Kod ve isim gerekli' },
        { status: 400 }
      )
    }

    // Kod zaten var mı kontrol et
    const existing = await kvDb.event.findUnique({ code: code.toUpperCase() })
    if (existing) {
      return NextResponse.json(
        { error: 'Bu kod zaten kullanılıyor' },
        { status: 400 }
      )
    }

    const event = await kvDb.event.create({
      code: code.toUpperCase(),
      name,
      description,
      maxFiles,
      maxFileSize,
      allowedTypes,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      isActive: true,
      createdBy: 'admin'
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Event creation error:', error)
    return NextResponse.json(
      { error: 'Etkinlik oluşturulamadı' },
      { status: 500 }
    )
  }
}
