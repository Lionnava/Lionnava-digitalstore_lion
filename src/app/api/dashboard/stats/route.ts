import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Total productos y stock bajo
    const totalProductos = await db.producto.count({
      where: { activo: true }
    })

    const stockBajo = await db.producto.count({
      where: {
        activo: true,
        stockActual: { lte: 0 },
        stockMinimo: { gt: 0 }
      }
    })

    // Ventas hoy
    const ventasHoy = await db.detalleVenta.aggregate({
      _sum: { subtotal: true },
      where: {
        venta: {
          fecha: { gte: startOfDay }
        }
      }
    })

    // Ventas del mes
    const ventasMes = await db.detalleVenta.aggregate({
      _sum: { subtotal: true },
      where: {
        venta: {
          fecha: { gte: startOfMonth }
        }
      }
    })

    // Costo de ventas del mes (para calcular ganancia)
    const costoVentasMes = await db.detalleVenta.findMany({
      where: {
        venta: {
          fecha: { gte: startOfMonth }
        }
      },
      include: {
        producto: true
      }
    })

    const costoTotalMes = costoVentasMes.reduce((sum, item) => {
      return sum + (item.producto.precioCosto * item.cantidad)
    }, 0)

    // Compras del mes
    const comprasMes = await db.detalleCompra.aggregate({
      _sum: { subtotal: true },
      where: {
        compra: {
          fecha: { gte: startOfMonth }
        }
      }
    })

    const stats = {
      totalProductos,
      stockBajo,
      ventasHoy: ventasHoy._sum.subtotal || 0,
      ventasMes: ventasMes._sum.subtotal || 0,
      comprasMes: comprasMes._sum.subtotal || 0,
      gananciaMes: (ventasMes._sum.subtotal || 0) - costoTotalMes
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
