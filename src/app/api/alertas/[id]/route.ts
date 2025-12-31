import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.alerta.update({
      where: { id: params.id },
      data: { leida: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking alert as read:', error)
    return NextResponse.json(
      { error: 'Error al marcar alerta como leída' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.alerta.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json(
      { error: 'Error al eliminar alerta' },
      { status: 500 }
    )
  }
}
