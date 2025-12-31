'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Plus, ShoppingBag, CheckCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Producto {
  id: string
  nombre: string
  codigoBarras?: string
  codigoQR?: string
  precioCosto: number
  stockActual: number
}

interface CompraItem {
  producto: Producto
  cantidad: number
  precioCosto: number
}

interface Compra {
  id: string
  fecha: string
  proveedor?: string
  total: number
  notas?: string
  detalles: CompraDetalle[]
}

interface CompraDetalle {
  id: string
  cantidad: number
  precioCosto: number
  producto: Producto
}

export default function Compras() {
  const [searchTerm, setSearchTerm] = useState('')
  const [compras, setCompras] = useState<Compra[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [carritoCompra, setCarritoCompra] = useState<CompraItem[]>([])
  const [formData, setFormData] = useState({
    proveedor: '',
    notas: ''
  })

  useEffect(() => {
    fetchCompras()
    fetchProductos()
  }, [])

  // Cargar carrito de compras desde localStorage
  useEffect(() => {
    const savedCarrito = localStorage.getItem('carritoCompra')
    const savedProveedor = localStorage.getItem('proveedorCompra')
    const savedNotas = localStorage.getItem('notasCompra')

    if (savedCarrito) {
      try {
        const carritoGuardado = JSON.parse(savedCarrito)
        setCarritoCompra(carritoGuardado)
        if (carritoGuardado.length > 0) {
          toast.info(`Compra en curso recuperada: ${carritoGuardado.length} productos`)
        }
      } catch (error) {
        console.error('Error loading carrito from localStorage:', error)
      }
    }

    if (savedProveedor) {
      setFormData(prev => ({ ...prev, proveedor: savedProveedor }))
    }

    if (savedNotas) {
      setFormData(prev => ({ ...prev, notas: savedNotas }))
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (carritoCompra.length > 0) {
      localStorage.setItem('carritoCompra', JSON.stringify(carritoCompra))
    } else {
      localStorage.removeItem('carritoCompra')
    }
  }, [carritoCompra])

  // Guardar proveedor y notas
  useEffect(() => {
    localStorage.setItem('proveedorCompra', formData.proveedor)
  }, [formData.proveedor])

  useEffect(() => {
    if (formData.notas) {
      localStorage.setItem('notasCompra', formData.notas)
    } else {
      localStorage.removeItem('notasCompra')
    }
  }, [formData.notas])

  // Confirmar antes de salir si hay carrito
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (carritoCompra.length > 0) {
        e.preventDefault()
        e.returnValue = 'Tienes una compra en curso. ¿Seguro que quieres salir?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [carritoCompra])

  const fetchCompras = async () => {
    try {
      const response = await fetch('/api/compras')
      if (response.ok) {
        const data = await response.json()
        setCompras(data)
      }
    } catch (error) {
      console.error('Error fetching compras:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProductos = async () => {
    try {
      const response = await fetch('/api/productos?activos=true')
      if (response.ok) {
        const data = await response.json()
        setProductos(data)
      }
    } catch (error) {
      console.error('Error fetching productos:', error)
    }
  }

  const handleFinalizarCompra = async () => {
    if (carritoCompra.length === 0) {
      toast.error('No hay productos en la compra')
      return
    }

    try {
      const response = await fetch('/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proveedor: formData.proveedor,
          notas: formData.notas,
          detalles: carritoCompra.map(item => ({
            productoId: item.producto.id,
            cantidad: item.cantidad,
            precioCosto: item.precioCosto
          }))
        })
      })

      if (response.ok) {
        toast.success('Compra registrada con éxito')
        setCarritoCompra([])
        setFormData({ proveedor: '', notas: '' })
        setDialogOpen(false)
        localStorage.removeItem('carritoCompra')
        localStorage.removeItem('proveedorCompra')
        localStorage.removeItem('notasCompra')
        fetchCompras()
        fetchProductos()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al registrar la compra')
      }
    } catch (error) {
      console.error('Error creating compra:', error)
      toast.error('Error al registrar la compra')
    }
  }

  const addToCarritoCompra = (producto: Producto) => {
    setCarritoCompra(prev => {
      const existing = prev.find(item => item.producto.id === producto.id)
      if (existing) {
        return prev.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }
      return [...prev, { producto, cantidad: 1, precioCosto: producto.precioCosto }]
    })
  }

  const removeFromCarritoCompra = (productoId: string) => {
    setCarritoCompra(prev => prev.filter(item => item.producto.id !== productoId))
  }

  const updateCantidadCompra = (productoId: string, delta: number) => {
    setCarritoCompra(prev => prev.map(item => {
      if (item.producto.id === productoId) {
        const newCantidad = item.cantidad + delta
        if (newCantidad <= 0) {
          removeFromCarritoCompra(productoId)
          return item
        }
        return { ...item, cantidad: newCantidad }
      }
      return item
    }))
  }

  const updatePrecioCosto = (productoId: string, precio: number) => {
    setCarritoCompra(prev => prev.map(item =>
      item.producto.id === productoId
        ? { ...item, precioCosto: precio }
        : item
    ))
  }

  const totalCompra = carritoCompra.reduce(
    (sum, item) => sum + item.precioCosto * item.cantidad,
    0
  )

  const filteredProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigoBarras?.includes(searchTerm) ||
    p.codigoQR?.includes(searchTerm)
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
          <h2 className="text-3xl font-bold tracking-tight">Compras</h2>
          <p className="text-muted-foreground">Abastecimiento de productos</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Compra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Compra</DialogTitle>
              <DialogDescription>
                Agrega productos y registra el abastecimiento
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Buscar Productos</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4 max-h-[200px] overflow-y-auto">
                {filteredProductos.slice(0, 5).map((producto) => (
                  <div
                    key={producto.id}
                    className="p-2 rounded hover:bg-accent cursor-pointer flex justify-between items-center"
                    onClick={() => addToCarritoCompra(producto)}
                  >
                    <div>
                      <div className="font-medium">{producto.nombre}</div>
                      <div className="text-sm text-muted-foreground">
                        Stock actual: {producto.stockActual} | Precio costo: ${producto.precioCosto.toFixed(2)}
                      </div>
                    </div>
                    <Plus className="h-4 w-4" />
                  </div>
                ))}
              </div>

              {carritoCompra.length > 0 && (
                <div className="space-y-3">
                  <Label>Productos en Compra</Label>
                  <div className="border rounded-lg p-4 space-y-2 max-h-[250px] overflow-y-auto">
                    {carritoCompra.map((item) => (
                      <div key={item.producto.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-medium">{item.producto.nombre}</div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeFromCarritoCompra(item.producto.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Cantidad</Label>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => updateCantidadCompra(item.producto.id, -1)}
                              >
                                -
                              </Button>
                              <span className="w-12 text-center font-medium">{item.cantidad}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => updateCantidadCompra(item.producto.id, 1)}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Precio Costo Unitario</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.precioCosto}
                              onChange={(e) => updatePrecioCosto(item.producto.id, parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <div className="text-right font-semibold mt-2">
                          Subtotal: ${(item.precioCosto * item.cantidad).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proveedor">Proveedor</Label>
                    <Input
                      id="proveedor"
                      value={formData.proveedor}
                      onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                      placeholder="Nombre del proveedor"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notas">Notas (opcional)</Label>
                    <Textarea
                      id="notas"
                      value={formData.notas}
                      onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                      placeholder="Notas adicionales..."
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                    <span>Total Compra:</span>
                    <span>${totalCompra.toFixed(2)}</span>
                  </div>

                  <Button onClick={handleFinalizarCompra} className="w-full" size="lg">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Registrar Compra
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Historial de Compras</h3>
        {compras.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay compras registradas</p>
            </CardContent>
          </Card>
        ) : (
          compras.map((compra) => (
            <Card key={compra.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">
                        {compra.proveedor || 'Compra sin proveedor'}
                      </h4>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {new Date(compra.fecha).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="text-sm mt-2">
                      <span className="font-medium">Productos:</span> {compra.detalles.length}
                    </div>
                    {compra.notas && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {compra.notas}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ${compra.total.toFixed(2)}
                    </div>
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
