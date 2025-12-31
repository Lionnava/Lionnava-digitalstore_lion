import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const activos = searchParams.get('activos') === 'true'

    const productos = await db.producto.findMany({
      where: activos ? { activo: true } : undefined,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(productos)
  } catch (error) {
    console.error('Error fetching productos:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      nombre,
      codigoBarras,
      codigoQR,
      descripcion,
      precioCosto,
      precioVenta,
      stockActual,
      stockMinimo,
      categoria,
      proveedor,
      fechaVencimiento
    } = body

    // Validar que el código de barras o QR no existan
    if (codigoBarras) {
      const existing = await db.producto.findUnique({
        where: { codigoBarras }
      })
      if (existing) {
        return NextResponse.json(
          { error: 'El código de barras ya existe' },
          { status: 400 }
        )
      }
    }

    if (codigoQR) {
      const existing = await db.producto.findUnique({
        where: { codigoQR }
      })
      if (existing) {
        return NextResponse.json(
          { error: 'El código QR ya existe' },
          { status: 400 }
        )
      }
    }

    const producto = await db.producto.create({
      data: {
        nombre,
        codigoBarras: codigoBarras || null,
        codigoQR: codigoQR || null,
        descripcion: descripcion || null,
        precioCosto: precioCosto || 0,
        precioVenta,
        stockActual: stockActual || 0,
        stockMinimo: stockMinimo || 0,
        categoria: categoria || null,
        proveedor: proveedor || null,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null
      }
    })

    return NextResponse.json(producto, { status: 201 })
  } catch (error) {
    console.error('Error creating producto:', error)
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}
