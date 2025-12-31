import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')

    if (!tipo) {
      return NextResponse.json(
        { error: 'Tipo de reporte requerido' },
        { status: 400 }
      )
    }

    const fechaDesde = desde ? new Date(desde) : undefined
    const fechaHasta = hasta ? new Date(hasta) : undefined

    let data: any = {}

    switch (tipo) {
      case 'ventas-dia':
      case 'ventas-periodo':
        const ventas = await db.venta.findMany({
          where: {
            fecha: {
              gte: fechaDesde,
              lte: fechaHasta
            }
          },
          include: {
            detalles: {
              include: {
                producto: true
              }
            }
          },
          orderBy: { fecha: 'desc' }
        })

        const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0)

        data = {
          ventas,
          resumen: {
            totalVentas,
            cantidadVentas: ventas.length,
            promedioVenta: ventas.length > 0 ? totalVentas / ventas.length : 0
          }
        }
        break

      case 'productos-mas-vendidos':
        const productosVendidos = await db.detalleVenta.groupBy({
          by: ['productoId'],
          where: {
            venta: {
              fecha: {
                gte: fechaDesde,
                lte: fechaHasta
              }
            }
          },
          _sum: {
            cantidad: true,
            subtotal: true
          },
          orderBy: {
            _sum: {
              cantidad: 'desc'
            }
          },
          take: 20
        })

        const productosConNombres = await Promise.all(
          productosVendidos.map(async (p) => {
            const producto = await db.producto.findUnique({
              where: { id: p.productoId },
              select: { nombre: true }
            })
            return {
              nombre: producto?.nombre || 'Desconocido',
              totalVendido: p._sum.cantidad || 0,
              ingresos: p._sum.subtotal || 0
            }
          })
        )

        data = {
          productos: productosConNombres,
          resumen: {
            totalProductos: productosConNombres.length,
            totalUnidades: productosConNombres.reduce((sum, p) => sum + p.totalVendido, 0),
            totalIngresos: productosConNombres.reduce((sum, p) => sum + p.ingresos, 0)
          }
        }
        break

      case 'inventario':
        const inventario = await db.producto.findMany({
          where: { activo: true },
          orderBy: { nombre: 'asc' }
        })

        const valorInventario = inventario.reduce((sum, p) => sum + (p.precioVenta * p.stockActual), 0)

        data = {
          productos: inventario,
          resumen: {
            totalProductos: inventario.length,
            totalUnidades: inventario.reduce((sum, p) => sum + p.stockActual, 0),
            valorTotal: valorInventario
          }
        }
        break

      case 'stock-bajo':
        const stockBajo = await db.producto.findMany({
          where: {
            activo: true,
            stockActual: {
              lte: 0
            },
            stockMinimo: {
              gt: 0
            }
          },
          orderBy: [
            { stockActual: 'asc' },
            { nombre: 'asc' }
          ]
        })

        data = {
          productos: stockBajo,
          resumen: {
            totalProductos: stockBajo.length
          }
        }
        break

      default:
        return NextResponse.json(
          { error: 'Tipo de reporte no válido' },
          { status: 400 }
        )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Error al generar reporte' },
      { status: 500 }
    )
  }
}
