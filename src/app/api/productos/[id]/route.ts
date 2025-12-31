import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const producto = await db.producto.findUnique({
      where: { id: params.id }
    })

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(producto)
  } catch (error) {
    console.error('Error fetching producto:', error)
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      fechaVencimiento,
      activo
    } = body

    // Verificar que el producto existe
    const existing = await db.producto.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Validar códigos únicos si se cambiaron
    if (codigoBarras && codigoBarras !== existing.codigoBarras) {
      const duplicate = await db.producto.findUnique({
        where: { codigoBarras }
      })
      if (duplicate) {
        return NextResponse.json(
          { error: 'El código de barras ya existe' },
          { status: 400 }
        )
      }
    }

    if (codigoQR && codigoQR !== existing.codigoQR) {
      const duplicate = await db.producto.findUnique({
        where: { codigoQR }
      })
      if (duplicate) {
        return NextResponse.json(
          { error: 'El código QR ya existe' },
          { status: 400 }
        )
      }
    }

    const producto = await db.producto.update({
      where: { id: params.id },
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
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        activo: activo !== undefined ? activo : existing.activo
      }
    })

    return NextResponse.json(producto)
  } catch (error) {
    console.error('Error updating producto:', error)
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que el producto existe
    const existing = await db.producto.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Soft delete
    await db.producto.update({
      where: { id: params.id },
      data: { activo: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting producto:', error)
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    )
  }
}
