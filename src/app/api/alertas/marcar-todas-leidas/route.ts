import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH() {
  try {
    await db.alerta.updateMany({
      where: { leida: false },
      data: { leida: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking all alerts as read:', error)
    return NextResponse.json(
      { error: 'Error al marcar alertas como leídas' },
      { status: 500 }
    )
  }
}
