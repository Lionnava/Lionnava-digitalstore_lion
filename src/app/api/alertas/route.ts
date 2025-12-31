import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const alertas = await db.alerta.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Enriquecer con datos del producto si es necesario
    const alertasConProducto = await Promise.all(
      alertas.map(async (alerta) => {
        if (alerta.productoId) {
          const producto = await db.producto.findUnique({
            where: { id: alerta.productoId },
            select: { nombre: true }
          })
          return {
            ...alerta,
            producto
          }
        }
        return alerta
      })
    )

    return NextResponse.json(alertasConProducto)
  } catch (error) {
    console.error('Error fetching alertas:', error)
    return NextResponse.json(
      { error: 'Error al obtener alertas' },
      { status: 500 }
    )
  }
}

export async function PATCH() {
  try {
    const result = await db.alerta.updateMany({
      where: { leida: false },
      data: { leida: true }
    })

    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    console.error('Error marking all alertas as read:', error)
    return NextResponse.json(
      { error: 'Error al marcar alertas como leídas' },
      { status: 500 }
    )
  }
}
