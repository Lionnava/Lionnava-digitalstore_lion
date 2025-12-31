'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Camera, X, Plus, Minus, ShoppingBag, Trash2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Html5Qrcode } from 'html5-qrcode'

interface Producto {
  id: string
  nombre: string
  codigoBarras?: string
  codigoQR?: string
  precioVenta: number
  stockActual: number
}

interface CarritoItem {
  producto: Producto
  cantidad: number
}

export default function Ventas() {
  const [searchTerm, setSearchTerm] = useState('')
  const [carrito, setCarrito] = useState<CarritoItem[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [scanDialogOpen, setScanDialogOpen] = useState(false)
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null)
  const [scanning, setScanning] = useState(false)
  const [compraDialogOpen, setCompraDialogOpen] = useState(false)
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [notas, setNotas] = useState('')

  useEffect(() => {
    fetchProductos()
  }, [])

  // Cargar carrito desde localStorage
  useEffect(() => {
    const savedCarrito = localStorage.getItem('carritoVenta')
    const savedMetodoPago = localStorage.getItem('metodoPago')
    const savedNotas = localStorage.getItem('notasVenta')

    if (savedCarrito) {
      try {
        const carritoGuardado = JSON.parse(savedCarrito)
        setCarrito(carritoGuardado)
        if (carritoGuardado.length > 0) {
          toast.info(`Venta en curso recuperada: ${carritoGuardado.length} productos`)
        }
      } catch (error) {
        console.error('Error loading carrito from localStorage:', error)
      }
    }

    if (savedMetodoPago) {
      setMetodoPago(savedMetodoPago)
    }

    if (savedNotas) {
      setNotas(savedNotas)
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (carrito.length > 0) {
      localStorage.setItem('carritoVenta', JSON.stringify(carrito))
    } else {
      localStorage.removeItem('carritoVenta')
    }
  }, [carrito])

  // Guardar método de pago y notas
  useEffect(() => {
    localStorage.setItem('metodoPago', metodoPago)
  }, [metodoPago])

  useEffect(() => {
    if (notas) {
      localStorage.setItem('notasVenta', notas)
    } else {
      localStorage.removeItem('notasVenta')
    }
  }, [notas])

  // Confirmar antes de salir si hay carrito
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (carrito.length > 0) {
        e.preventDefault()
        e.returnValue = 'Tienes una venta en curso. ¿Seguro que quieres salir?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [carrito])

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.stop().catch(console.error)
      }
    }
  }, [scanner])

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

  const startScanner = async () => {
    setScanDialogOpen(true)
    setScanning(true)

    try {
      const html5QrCode = new Html5Qrcode('reader')
      setScanner(html5QrCode)

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleScanSuccess(decodedText)
        },
        () => {}
      )
    } catch (error) {
      console.error('Error starting scanner:', error)
      toast.error('No se pudo iniciar la cámara')
      setScanDialogOpen(false)
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    setScanning(false)
    if (scanner) {
      try {
        await scanner.stop()
      } catch (error) {
        console.error('Error stopping scanner:', error)
      }
    }
    setScanDialogOpen(false)
  }

  const handleScanSuccess = (decodedText: string) => {
    const producto = productos.find(
      p => p.codigoBarras === decodedText || p.codigoQR === decodedText
    )

    if (producto) {
      addToCarrito(producto)
      toast.success(`Producto agregado: ${producto.nombre}`)
    } else {
      toast.error('Producto no encontrado')
    }

    stopScanner()
  }

  const addToCarrito = (producto: Producto) => {
    setCarrito(prev => {
      const existing = prev.find(item => item.producto.id === producto.id)
      if (existing) {
        if (existing.cantidad >= producto.stockActual) {
          toast.error('No hay suficiente stock')
          return prev
        }
        return prev.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }
      return [...prev, { producto, cantidad: 1 }]
    })
  }

  const removeFromCarrito = (productoId: string) => {
    setCarrito(prev => prev.filter(item => item.producto.id !== productoId))
  }

  const updateCantidad = (productoId: string, delta: number) => {
    setCarrito(prev => prev.map(item => {
      if (item.producto.id === productoId) {
        const newCantidad = item.cantidad + delta
        if (newCantidad <= 0) {
          removeFromCarrito(productoId)
          return item
        }
        if (newCantidad > item.producto.stockActual) {
          toast.error('No hay suficiente stock')
          return item
        }
        return { ...item, cantidad: newCantidad }
      }
      return item
    }))
  }

  const handleBuscarPorCodigo = () => {
    const producto = productos.find(
      p => p.codigoBarras === searchTerm || p.codigoQR === searchTerm
    )
    if (producto) {
      addToCarrito(producto)
      setSearchTerm('')
      toast.success(`Producto agregado: ${producto.nombre}`)
    } else {
      toast.error('Producto no encontrado')
    }
  }

  const filteredProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigoBarras?.includes(searchTerm) ||
    p.codigoQR?.includes(searchTerm)
  )

  const total = carrito.reduce(
    (sum, item) => sum + item.producto.precioVenta * item.cantidad,
    0
  )

  const totalItems = carrito.reduce(
    (sum, item) => sum + item.cantidad,
    0
  )

  const handleFinalizarVenta = async () => {
    if (carrito.length === 0) {
      toast.error('El carrito está vacío')
      return
    }

    try {
      const response = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detalles: carrito.map(item => ({
            productoId: item.producto.id,
            cantidad: item.cantidad,
            precioUnitario: item.producto.precioVenta
          })),
          metodoPago,
          notas
        })
      })

      if (response.ok) {
        toast.success('Venta realizada con éxito')
        setCarrito([])
        setNotas('')
        setMetodoPago('efectivo')
        setCompraDialogOpen(false)
        localStorage.removeItem('carritoVenta')
        localStorage.removeItem('notasVenta')
        localStorage.removeItem('metodoPago')
        fetchProductos()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al realizar la venta')
      }
    } catch (error) {
      console.error('Error creating venta:', error)
      toast.error('Error al realizar la venta')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ventas</h2>
          <p className="text-muted-foreground">Punto de venta</p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar producto o escanear código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={startScanner}
          >
            <Camera className="h-4 w-4 mr-2" />
            Escanear
          </Button>
          <Button
            onClick={handleBuscarPorCodigo}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Productos Disponibles</CardTitle>
            <CardDescription>
              {productos.length} productos en inventario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredProductos.map((producto) => (
                <div
                  key={producto.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                    producto.stockActual === 0 ? 'opacity-50' : ''
                  }`}
                  onClick={() => producto.stockActual > 0 && addToCarrito(producto)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{producto.nombre}</h4>
                      <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                        <span>${producto.precioVenta.toFixed(2)}</span>
                        <span>•</span>
                        <span className={
                          producto.stockActual <= 5 ? 'text-orange-500' : ''
                        }>
                          Stock: {producto.stockActual}
                        </span>
                      </div>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Carrito de Venta
            </CardTitle>
            <CardDescription>
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {carrito.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>El carrito está vacío</p>
                </div>
              ) : (
                carrito.map((item) => (
                  <div key={item.producto.id} className="p-3 rounded-lg border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.producto.nombre}</h4>
                        <p className="text-sm text-muted-foreground">
                          ${item.producto.precioVenta.toFixed(2)} c/u
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFromCarrito(item.producto.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateCantidad(item.producto.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.cantidad}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateCantidad(item.producto.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="font-semibold">
                        ${(item.producto.precioVenta * item.cantidad).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {carrito.length > 0 && (
              <div className="border-t mt-4 pt-4 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setCompraDialogOpen(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finalizar Venta
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scan Dialog */}
      <Dialog open={scanDialogOpen} onOpenChange={(open) => {
        if (!open) stopScanner()
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escanear Código</DialogTitle>
            <DialogDescription>
              Apunta la cámara al código de barras o QR
            </DialogDescription>
          </DialogHeader>
          <div id="reader" className="w-full" />
          <Button onClick={stopScanner} variant="outline" className="w-full">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </DialogContent>
      </Dialog>

      {/* Finalizar Venta Dialog */}
      <Dialog open={compraDialogOpen} onOpenChange={setCompraDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Venta</DialogTitle>
            <DialogDescription>
              Resumen de la venta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 space-y-2 max-h-[300px] overflow-y-auto">
              {carrito.map((item) => (
                <div key={item.producto.id} className="flex justify-between text-sm">
                  <span>
                    {item.producto.nombre} x{item.cantidad}
                  </span>
                  <span>${(item.producto.precioVenta * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={metodoPago === 'efectivo' ? 'default' : 'outline'}
                  onClick={() => setMetodoPago('efectivo')}
                  className="flex-1"
                >
                  Efectivo
                </Button>
                <Button
                  type="button"
                  variant={metodoPago === 'tarjeta' ? 'default' : 'outline'}
                  onClick={() => setMetodoPago('tarjeta')}
                  className="flex-1"
                >
                  Tarjeta
                </Button>
                <Button
                  type="button"
                  variant={metodoPago === 'transferencia' ? 'default' : 'outline'}
                  onClick={() => setMetodoPago('transferencia')}
                  className="flex-1"
                >
                  Transferencia
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas (opcional)</Label>
              <textarea
                id="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Notas adicionales..."
              />
            </div>

            <Button onClick={handleFinalizarVenta} className="w-full" size="lg">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Venta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
