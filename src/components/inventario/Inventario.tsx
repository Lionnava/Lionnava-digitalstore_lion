'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Search, Edit, Trash2, Camera, Package, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface Producto {
  id: string
  nombre: string
  codigoBarras?: string
  codigoQR?: string
  descripcion?: string
  precioCosto: number
  precioVenta: number
  stockActual: number
  stockMinimo: number
  categoria?: string
  proveedor?: string
  fechaVencimiento?: string
  imagen?: string
  activo: boolean
}

export default function Inventario() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    codigoBarras: '',
    codigoQR: '',
    descripcion: '',
    precioCosto: '',
    precioVenta: '',
    stockActual: '',
    stockMinimo: '',
    categoria: '',
    proveedor: '',
    fechaVencimiento: ''
  })

  useEffect(() => {
    fetchProductos()
  }, [])

  const fetchProductos = async () => {
    try {
      const response = await fetch('/api/productos')
      if (response.ok) {
        const data = await response.json()
        setProductos(data)
      }
    } catch (error) {
      console.error('Error fetching productos:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingProducto
        ? `/api/productos/${editingProducto.id}`
        : '/api/productos'

      const method = editingProducto ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          precioCosto: parseFloat(formData.precioCosto) || 0,
          precioVenta: parseFloat(formData.precioVenta) || 0,
          stockActual: parseInt(formData.stockActual) || 0,
          stockMinimo: parseInt(formData.stockMinimo) || 0
        })
      })

      if (response.ok) {
        toast.success(editingProducto ? 'Producto actualizado' : 'Producto creado')
        setDialogOpen(false)
        resetForm()
        fetchProductos()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al guardar producto')
      }
    } catch (error) {
      console.error('Error saving producto:', error)
      toast.error('Error al guardar producto')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    try {
      const response = await fetch(`/api/productos/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Producto eliminado')
        fetchProductos()
      } else {
        toast.error('Error al eliminar producto')
      }
    } catch (error) {
      console.error('Error deleting producto:', error)
      toast.error('Error al eliminar producto')
    }
  }

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto)
    setFormData({
      nombre: producto.nombre,
      codigoBarras: producto.codigoBarras || '',
      codigoQR: producto.codigoQR || '',
      descripcion: producto.descripcion || '',
      precioCosto: producto.precioCosto.toString(),
      precioVenta: producto.precioVenta.toString(),
      stockActual: producto.stockActual.toString(),
      stockMinimo: producto.stockMinimo.toString(),
      categoria: producto.categoria || '',
      proveedor: producto.proveedor || '',
      fechaVencimiento: producto.fechaVencimiento?.split('T')[0] || ''
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingProducto(null)
    setFormData({
      nombre: '',
      codigoBarras: '',
      codigoQR: '',
      descripcion: '',
      precioCosto: '',
      precioVenta: '',
      stockActual: '',
      stockMinimo: '',
      categoria: '',
      proveedor: '',
      fechaVencimiento: ''
    })
  }

  const filteredProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigoBarras?.includes(searchTerm) ||
    p.codigoQR?.includes(searchTerm) ||
    p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-4 w-1/3 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-1/4 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventario</h2>
          <p className="text-muted-foreground">Gestiona tus productos</p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
                </DialogTitle>
                <DialogDescription>
                  Completa los datos del producto
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nombre">Nombre del producto *</Label>
                    <Input
                      id="nombre"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codigoBarras">Código de Barras</Label>
                    <div className="flex gap-2">
                      <Input
                        id="codigoBarras"
                        value={formData.codigoBarras}
                        onChange={(e) => setFormData({ ...formData, codigoBarras: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codigoQR">Código QR</Label>
                    <Input
                      id="codigoQR"
                      value={formData.codigoQR}
                      onChange={(e) => setFormData({ ...formData, codigoQR: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precioCosto">Precio Costo</Label>
                    <Input
                      id="precioCosto"
                      type="number"
                      step="0.01"
                      value={formData.precioCosto}
                      onChange={(e) => setFormData({ ...formData, precioCosto: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precioVenta">Precio Venta *</Label>
                    <Input
                      id="precioVenta"
                      type="number"
                      step="0.01"
                      required
                      value={formData.precioVenta}
                      onChange={(e) => setFormData({ ...formData, precioVenta: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stockActual">Stock Actual</Label>
                    <Input
                      id="stockActual"
                      type="number"
                      value={formData.stockActual}
                      onChange={(e) => setFormData({ ...formData, stockActual: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stockMinimo">Stock Mínimo</Label>
                    <Input
                      id="stockMinimo"
                      type="number"
                      value={formData.stockMinimo}
                      onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría</Label>
                    <Input
                      id="categoria"
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proveedor">Proveedor</Label>
                    <Input
                      id="proveedor"
                      value={formData.proveedor}
                      onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaVencimiento">Fecha Vencimiento</Label>
                    <Input
                      id="fechaVencimiento"
                      type="date"
                      value={formData.fechaVencimiento}
                      onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingProducto ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        {filteredProductos.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay productos encontrados</p>
              {searchTerm && (
                <Button
                  variant="link"
                  onClick={() => setSearchTerm('')}
                  className="mt-2"
                >
                  Limpiar búsqueda
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredProductos.map((producto) => (
            <Card key={producto.id} className={
              producto.stockActual <= producto.stockMinimo
                ? 'border-orange-500'
                : ''
            }>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{producto.nombre}</h3>
                      {producto.stockActual <= producto.stockMinimo && (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    {producto.categoria && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {producto.categoria}
                      </Badge>
                    )}
                    <div className="mt-2 text-sm text-muted-foreground space-y-1">
                      {producto.codigoBarras && (
                        <div>Código: {producto.codigoBarras}</div>
                      )}
                      <div className="flex gap-4">
                        <span>Stock: <span className={
                          producto.stockActual <= producto.stockMinimo
                            ? 'text-orange-500 font-semibold'
                            : ''
                        }>{producto.stockActual}</span></span>
                        <span>Precio: ${producto.precioVenta.toFixed(2)}</span>
                      </div>
                      {producto.fechaVencimiento && (
                        <div>Vence: {new Date(producto.fechaVencimiento).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(producto)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(producto.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function Badge({ children, variant }: { children: React.ReactNode, variant?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
      variant === 'secondary' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'
    }`}>
      {children}
    </span>
  )
}
