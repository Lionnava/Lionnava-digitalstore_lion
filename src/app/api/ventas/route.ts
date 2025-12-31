import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { detalles, metodoPago, notas } = body

    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      return NextResponse.json(
        { error: 'Debe incluir al menos un detalle de venta' },
        { status: 400 }
      )
    }

    // Calcular total
    let total = 0
    for (const detalle of detalles) {
      total += detalle.precioUnitario * detalle.cantidad
    }

    // Crear venta con transacción
    const venta = await db.venta.create({
      data: {
        fecha: new Date(),
        total,
        metodoPago: metodoPago || 'efectivo',
        notas: notas || null,
        detalles: {
          create: await Promise.all(detalles.map(async (detalle: any) => {
            // Verificar stock disponible
            const producto = await db.producto.findUnique({
              where: { id: detalle.productoId }
            })

            if (!producto) {
              throw new Error(`Producto no encontrado: ${detalle.productoId}`)
            }

            if (producto.stockActual < detalle.cantidad) {
              throw new Error(`Stock insuficiente para ${producto.nombre}`)
            }

            // Actualizar stock
            await db.producto.update({
              where: { id: detalle.productoId },
              data: {
                stockActual: {
                  decrement: detalle.cantidad
                }
              }
            })

            return {
              productoId: detalle.productoId,
              cantidad: detalle.cantidad,
              precioUnitario: detalle.precioUnitario,
              subtotal: detalle.precioUnitario * detalle.cantidad
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

    // Verificar stock bajo y crear alertas
    for (const detalle of venta.detalles) {
      if (detalle.producto.stockActual <= detalle.producto.stockMinimo) {
        await db.alerta.create({
          data: {
            tipo: 'stock_bajo',
            titulo: 'Stock Bajo',
            mensaje: `El producto "${detalle.producto.nombre}" tiene stock bajo (${detalle.producto.stockActual} unidades)`,
            productoId: detalle.producto.id
          }
        })
      }
    }

    return NextResponse.json(venta, { status: 201 })
  } catch (error: any) {
    console.error('Error creating venta:', error)
    return NextResponse.json(
      { error: error.message || 'Error al realizar la venta' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const ventas = await db.venta.findMany({
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

    return NextResponse.json(ventas)
  } catch (error) {
    console.error('Error fetching ventas:', error)
    return NextResponse.json(
      { error: 'Error al obtener ventas' },
      { status: 500 }
    )
  }
}
