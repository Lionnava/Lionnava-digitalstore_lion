'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Printer, Download, Calendar, TrendingUp, Package, ShoppingCart, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface VentaReport {
  id: string
  fecha: string
  total: number
  metodoPago: string
  detalles: {
    producto: { nombre: string }
    cantidad: number
    precioUnitario: number
    subtotal: number
  }[]
}

interface ProductoMasVendido {
  nombre: string
  totalVendido: number
  ingresos: number
}

export default function Reportes() {
  const [tipoReporte, setTipoReporte] = useState('ventas-dia')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [datos, setDatos] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().split('T')[0]
    setFechaDesde(firstDayOfMonth)
    setFechaHasta(today)
  }, [])

  const generarReporte = async () => {
    if (!fechaDesde || !fechaHasta) {
      toast.error('Selecciona las fechas')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/reportes?tipo=${tipoReporte}&desde=${fechaDesde}&hasta=${fechaHasta}`)
      if (response.ok) {
        const data = await response.json()
        setDatos(data)
        toast.success('Reporte generado')
      } else {
        toast.error('Error al generar reporte')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Error al generar reporte')
    } finally {
      setLoading(false)
    }
  }

  const imprimirReporte = () => {
    window.print()
  }

  const exportarCSV = () => {
    if (!datos) return

    let csv = ''
    let filename = 'reporte.csv'

    switch (tipoReporte) {
      case 'ventas-dia':
      case 'ventas-periodo':
        csv = 'ID,Fecha,Total,Método de Pago\n'
        datos.ventas.forEach((v: VentaReport) => {
          csv += `${v.id},${new Date(v.fecha).toLocaleDateString()},${v.total},${v.metodoPago}\n`
        })
        filename = 'ventas.csv'
        break

      case 'productos-mas-vendidos':
        csv = 'Producto,Cantidad Vendida,Ingresos\n'
        datos.productos.forEach((p: ProductoMasVendido) => {
          csv += `${p.nombre},${p.totalVendido},${p.ingresos}\n`
        })
        filename = 'productos-mas-vendidos.csv'
        break

      case 'inventario':
        csv = 'Nombre,Stock Actual,Stock Mínimo,Precio Venta,Categoría\n'
        datos.productos.forEach((p: any) => {
          csv += `${p.nombre},${p.stockActual},${p.stockMinimo},${p.precioVenta},${p.categoria || ''}\n`
        })
        filename = 'inventario.csv'
        break

      case 'stock-bajo':
        csv = 'Nombre,Stock Actual,Stock Mínimo,Categoría\n'
        datos.productos.forEach((p: any) => {
          csv += `${p.nombre},${p.stockActual},${p.stockMinimo},${p.categoria || ''}\n`
        })
        filename = 'stock-bajo.csv'
        break
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    toast.success('Reporte exportado')
  }

  const renderReporte = () => {
    if (!datos) return null

    switch (tipoReporte) {
      case 'ventas-dia':
      case 'ventas-periodo':
        return <ReporteVentas datos={datos} />

      case 'productos-mas-vendidos':
        return <ReporteProductosMasVendidos datos={datos} />

      case 'inventario':
        return <ReporteInventario datos={datos} />

      case 'stock-bajo':
        return <ReporteStockBajo datos={datos} />

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reportes</h2>
          <p className="text-muted-foreground">Genera e imprime reportes de tu negocio</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Configuración del Reporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Reporte</Label>
                <Select value={tipoReporte} onValueChange={setTipoReporte}>
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ventas-dia">Ventas del Día</SelectItem>
                    <SelectItem value="ventas-periodo">Ventas por Período</SelectItem>
                    <SelectItem value="productos-mas-vendidos">Productos Más Vendidos</SelectItem>
                    <SelectItem value="inventario">Inventario Completo</SelectItem>
                    <SelectItem value="stock-bajo">Productos con Stock Bajo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(tipoReporte === 'ventas-dia' || tipoReporte === 'ventas-periodo' ||
                tipoReporte === 'productos-mas-vendidos') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="desde">Fecha Desde</Label>
                    <input
                      id="desde"
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hasta">Fecha Hasta</Label>
                    <input
                      id="hasta"
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={generarReporte} disabled={loading}>
                <FileText className="h-4 w-4 mr-2" />
                Generar Reporte
              </Button>
              {datos && (
                <>
                  <Button onClick={imprimirReporte} variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button onClick={exportarCSV} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {datos && renderReporte()}
    </div>
  )
}

function ReporteVentas({ datos }: { datos: { ventas: VentaReport[], resumen: any } }) {
  const totalVentas = datos.ventas.reduce((sum: number, v: VentaReport) => sum + v.total, 0)

  return (
    <div className="space-y-4 print:space-y-2">
      <Card className="print:border print:shadow-none">
        <CardHeader>
          <CardTitle>Reporte de Ventas</CardTitle>
          <CardDescription>
            Total: ${totalVentas.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {datos.ventas.map((venta) => (
              <div key={venta.id} className="border rounded-lg p-3 print:p-2">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-sm">
                      {new Date(venta.fecha).toLocaleString('es-ES')}
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {venta.metodoPago}
                    </Badge>
                  </div>
                  <div className="font-bold text-lg">
                    ${venta.total.toFixed(2)}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-1 mt-2 print:mt-1">
                  {venta.detalles.map((detalle, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span>{detalle.producto.nombre} x{detalle.cantidad}</span>
                      <span>${detalle.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ReporteProductosMasVendidos({ datos }: { datos: { productos: ProductoMasVendido[] } }) {
  const totalUnidades = datos.productos.reduce((sum: number, p: ProductoMasVendido) => sum + p.totalVendido, 0)
  const totalIngresos = datos.productos.reduce((sum: number, p: ProductoMasVendido) => sum + p.ingresos, 0)

  return (
    <Card className="print:border print:shadow-none">
      <CardHeader>
        <CardTitle>Productos Más Vendidos</CardTitle>
        <CardDescription>
          Total: {totalUnidades} unidades vendidas por ${totalIngresos.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {datos.productos.map((producto, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 border rounded-lg print:p-2">
              <div>
                <div className="font-medium flex items-center gap-2">
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                    #{idx + 1}
                  </span>
                  {producto.nombre}
                </div>
                <div className="text-sm text-muted-foreground">
                  {producto.totalVendido} unidades vendidas
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">
                  ${producto.ingresos.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ReporteInventario({ datos }: { datos: { productos: any[], resumen: any } }) {
  return (
    <Card className="print:border print:shadow-none">
      <CardHeader>
        <CardTitle>Reporte de Inventario</CardTitle>
        <CardDescription>
          Total: {datos.productos.length} productos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {datos.productos.map((producto) => (
            <div key={producto.id} className="flex justify-between items-center p-3 border rounded-lg print:p-2">
              <div>
                <div className="font-medium">{producto.nombre}</div>
                <div className="text-sm text-muted-foreground">
                  Stock: {producto.stockActual} | Min: {producto.stockMinimo}
                </div>
                {producto.categoria && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {producto.categoria}
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <div className="font-bold">
                  ${producto.precioVenta.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ReporteStockBajo({ datos }: { datos: { productos: any[] } }) {
  return (
    <Card className="border-orange-500 print:border print:shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <Package className="h-5 w-5" />
          Productos con Stock Bajo
        </CardTitle>
        <CardDescription>
          {datos.productos.length} productos necesitan reabastecimiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {datos.productos.map((producto) => (
            <div key={producto.id} className="p-3 border rounded-lg bg-orange-50 dark:bg-orange-950/20 print:bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-orange-900 dark:text-orange-100">
                    {producto.nombre}
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">
                    Stock: {producto.stockActual} de {producto.stockMinimo} mínimo
                  </div>
                  {producto.proveedor && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Proveedor: {producto.proveedor}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-700">
                    {producto.stockActual}
                  </div>
                  <div className="text-xs text-muted-foreground">unidades</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
