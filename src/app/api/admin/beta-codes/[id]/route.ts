import { NextRequest, NextResponse } from 'next/server'
import { kvDb } from '@/lib/kv-db'

// PATCH - Beta kodu güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { isActive } = body

    const updated = await kvDb.betaCode.update(params.id, { isActive })
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Beta kodu bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ betaCode: updated })
  } catch (error) {
    console.error('Beta code update error:', error)
    return NextResponse.json(
      { error: 'Beta kodu güncellenemedi' },
      { status: 500 }
    )
  }
}

// DELETE - Beta kodu sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await kvDb.betaCode.delete(params.id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Beta kodu bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Beta code delete error:', error)
    return NextResponse.json(
      { error: 'Beta kodu silinemedi' },
      { status: 500 }
    )
  }
}
