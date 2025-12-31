import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { proveedor, notas, detalles } = body

    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      return NextResponse.json(
        { error: 'Debe incluir al menos un detalle de compra' },
        { status: 400 }
      )
    }

    // Calcular total
    let total = 0
    for (const detalle of detalles) {
      total += detalle.precioCosto * detalle.cantidad
    }

    // Crear compra con transacción
    const compra = await db.compra.create({
      data: {
        fecha: new Date(),
        proveedor: proveedor || null,
        total,
        notas: notas || null,
        detalles: {
          create: await Promise.all(detalles.map(async (detalle: any) => {
            // Verificar que el producto existe
            const producto = await db.producto.findUnique({
              where: { id: detalle.productoId }
            })

            if (!producto) {
              throw new Error(`Producto no encontrado: ${detalle.productoId}`)
            }

            // Actualizar stock
            await db.producto.update({
              where: { id: detalle.productoId },
              data: {
                stockActual: {
                  increment: detalle.cantidad
                },
                precioCosto: detalle.precioCosto // Actualizar precio de costo
              }
            })

            return {
              productoId: detalle.productoId,
              cantidad: detalle.cantidad,
              precioCosto: detalle.precioCosto,
              subtotal: detalle.precioCosto * detalle.cantidad
            }
          }))
        }
      },
      include: {
        detalles: {
          include: {
            producto: true
          }
        }
      }
    })

    return NextResponse.json(compra, { status: 201 })
  } catch (error: any) {
    console.error('Error creating compra:', error)
    return NextResponse.json(
      { error: error.message || 'Error al registrar la compra' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const compras = await db.compra.findMany({
      take: limit,
      skip: offset,
      orderBy: { fecha: 'desc' },
      include: {
        detalles: {
          include: {
            producto: true
          }
        }
      }
    })

    return NextResponse.json(compras)
  } catch (error) {
    console.error('Error fetching compras:', error)
    return NextResponse.json(
      { error: 'Error al obtener compras' },
      { status: 500 }
    )
  }
}
