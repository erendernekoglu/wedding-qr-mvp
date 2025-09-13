import { NextRequest, NextResponse } from 'next/server'
import { EVENT_TEMPLATES, getTemplateById, getTemplatesByCategory } from '@/lib/event-templates'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const id = searchParams.get('id')

    if (id) {
      // Tek şablon getir
      const template = getTemplateById(id)
      if (!template) {
        return NextResponse.json(
          { error: 'Şablon bulunamadı' },
          { status: 404 }
        )
      }
      return NextResponse.json({ template })
    }

    if (category) {
      // Kategoriye göre şablonları getir
      const templates = getTemplatesByCategory(category)
      return NextResponse.json({ templates })
    }

    // Tüm şablonları getir
    return NextResponse.json({ templates: EVENT_TEMPLATES })

  } catch (error) {
    console.error('Template fetch error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { templateId, customFields } = await req.json()

    if (!templateId) {
      return NextResponse.json(
        { error: 'Şablon ID gerekli' },
        { status: 400 }
      )
    }

    const template = getTemplateById(templateId)
    if (!template) {
      return NextResponse.json(
        { error: 'Şablon bulunamadı' },
        { status: 404 }
      )
    }

    // Şablondan etkinlik oluştur
    const eventData = {
      code: generateEventCode(),
      name: template.name,
      description: template.description,
      ...template.defaultSettings,
      customFields: customFields || template.customFields,
      createdAt: new Date().toISOString(),
      isActive: true,
      currentFiles: 0
    }

    // Burada kvDb.event.create çağrısı yapılacak
    // Şimdilik mock response döndürüyoruz
    return NextResponse.json({
      success: true,
      event: eventData,
      message: 'Etkinlik şablondan oluşturuldu'
    })

  } catch (error) {
    console.error('Template create error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

function generateEventCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
