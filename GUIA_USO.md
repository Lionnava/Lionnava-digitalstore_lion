# 🚀 GUÍA RÁPIDA DE USO - PARA EMPEZAR HOY MISMO

---

## ✅ LO PRIMERO QUE DEBES HACER

### 1. 💾 COPIA DE SEGURIDAD (5 MINUTOS)

**COPIA ESTA CARPETA A TU COMPUTADORA PERSONAL:**

```bash
# Método 1: Si tienes acceso SCP/SFTP
scp -r /home/z/my-project usuario@tu-pc:~/tienda-manager/
scp -r /home/z/backups usuario@tu-pc:~/respaldos-tienda/

# Método 2: Si puedes usar rsync
rsync -avz /home/z/my-project/ usuario@tu-pc:~/tienda-manager/
rsync -avz /home/z/backups/ usuario@tu-pc:~/respaldos-tienda/

# Método 3: Si puedes usar una memoria USB montada
cp -r /home/z/my-project /media/tu-usb/tienda-manager/
cp -r /home/z/backups /media/tu-usb/respaldos-tienda/
```

**IMPORTANTE:** Copia estos 6 archivos MD:
- ✅ `HISTORIAL_CHAT.md` (TODO lo que chateamos)
- ✅ `RESUMEN_FINAL.md` (Resumen completo)
- ✅ `INICIO_RESPALDOS.md` (Guía de respaldos)
- ✅ `PERSISTENCIA_DATOS.md` (Guía de persistencia)
- ✅ `DESPLEGUE_MULTI_DISPOSITIVOS.md` (Guía multi-dispositivo)
- ✅ `README.md` (Documentación original)

---

## 🏪 INICIAR LA APLICACIÓN

### Opción 1: Solo desarrollo (sin respaldos automáticos)
```bash
cd /home/z/my-project
bun run dev
```
**Acceder:** http://localhost:3000

### Opción 2: Con respaldos automáticos (RECOMENDADO)
```bash
# Terminal 1: Iniciar daemon de respaldos
cd /home/z
./backups/iniciar-daemon-respaldo.sh

# Terminal 2: Iniciar la aplicación
cd /home/z/my-project
bun run dev
```
**Resultado:** Respaldos cada 4 horas + aplicación funcionando

---

## 📱 PRIMEROS PASOS EN LA APLICACIÓN

### 1. AGREGAR PRODUCTOS (Inventario)

1. Entra a la pestaña **"Inventario"**
2. Click en **"Nuevo Producto"**
3. Completa los campos:
   - **Nombre** (obligatorio): Ej: "Coca-Cola 2L"
   - **Código de Barras**: Escanea el producto o ingresa manualmente
   - **Código QR**: Si tiene
   - **Precio Costo**: Lo que pagas por unidad
   - **Precio Venta** (obligatorio): Lo que vendes
   - **Stock Actual**: Cuántos tienes
   - **Stock Mínimo**: Cuándo necesitas reabastecer
   - **Categoría**: Ej: "Bebidas", "Abarrotes", "Limpieza"
   - **Proveedor**: ¿De quién compras?
   - **Fecha Vencimiento**: Si aplica
   - **Descripción**: Detalles adicionales
4. Click en **"Crear"**
5. Repite con todos tus productos

### 2. REALIZAR UNA VENTA (POS)

1. Entra a la pestaña **"Ventas"**
2. Busca el producto:
   - **Opción A:** Escribe el nombre
   - **Opción B:** Escribe el código de barras/QR
   - **Opción C:** Click en **"Escanear"** y usa la cámara
3. Click en **"Agregar"** o el producto
4. Repite para agregar más productos
5. Cuando termines, click en **"Finalizar Venta"**
6. Selecciona método de pago:
   - **Efectivo**
   - **Tarjeta**
   - **Transferencia**
7. Agrega notas si necesitas
8. Click en **"Confirmar Venta"**
9. ¡Listo! La venta se guardó y el stock se actualizó

### 3. REGISTRAR UNA COMPRA (Abastecimiento)

1. Entra a la pestaña **"Compras"**
2. Click en **"Nueva Compra"**
3. Busca productos y agrégalos al carrito de compra
4. Ajusta:
   - **Cantidad**: Cuántos compraste
   - **Precio Costo**: Precio por unidad
5. Completa:
   - **Proveedor**: ¿Quién te vendió?
   - **Notas**: Detalles adicionales
6. Click en **"Registrar Compra"**
7. ¡Listo! El stock se actualizó y el precio costo también

### 4. VER ALERTAS

1. Mira el icono de **campana** en la parte superior derecha
2. Si tiene un número, hay alertas no leídas
3. Click para ver:
   - **Stock bajo:** Productos que necesitan reabastecimiento
   - **Vencimientos:** Productos por vencer (futuro)
4. Puedes:
   - Marcar como leídas
   - Marcar todas como leídas
   - Eliminar alertas

### 5. GENERAR REPORTES

1. Entra a la pestaña **"Reportes"**
2. Selecciona el tipo de reporte:
   - **Ventas del día:** Ventas de hoy
   - **Ventas por período:** Entre fechas específicas
   - **Productos más vendidos:** Ranking de productos
   - **Inventario completo:** Todos los productos
   - **Stock bajo:** Productos que necesitan reabastecer
3. Selecciona fechas si aplica
4. Click en **"Generar Reporte"**
5. Puedes:
   - Click en **"Imprimir"** para imprimir
   - Click en **"Exportar CSV"** para Excel

---

## 🔄 VERIFICAR PERSISTENCIA

### Prueba 1: Carrito se guarda automáticamente

1. Entra a **"Ventas"**
2. Agrega 2-3 productos al carrito
3. **NO completes la venta**
4. Cierra la pestaña del navegador
5. Abre la aplicación de nuevo
6. Verás: **"Venta en curso recuperada: X productos"**
7. El carrito está exactamente como lo dejaste
8. ¡Ahora completa la venta!

### Prueba 2: Base de datos no se pierde

1. Realiza una venta completa
2. Cierra completamente la aplicación (Ctrl+C en terminal)
3. Inicia de nuevo: `bun run dev`
4. Entra a **"Reportes"** → **"Ventas del día"**
5. La venta que hiciste está ahí
6. ¡Datos preservados!

---

## 📊 VER EL DASHBOARD

1. Entra a la pestaña **"Dashboard"**
2. Verás:
   - **Total Productos:** Cuántos productos tienes
   - **Ventas Hoy:** Cuánto vendiste hoy
   - **Ventas Mes:** Total del mes
   - **Compras Mes:** Total de compras del mes
   - **Ganancia Estimada:** Ventas - Costos
   - **Alertas Activas:** Productos con stock bajo

---

## 📱 USAR EL ESCÁNER DE CÓDIGOS

### Requisitos:
- ✅ Cámara del dispositivo funcionando
- ✅ Productos con códigos de barras o QR registrados
- ✅ Permitir acceso a la cámara (el navegador lo preguntará)

### Pasos:
1. Entra a **"Ventas"**
2. Click en **"Escanear"**
3. Permite acceso a la cámara
4. Apunta al código de barras o QR
5. El sistema detectará y agregará el producto automáticamente
6. Si el código no está registrado, te avisará

---

## 🛡️ VERIFICAR RESPALDOS

### Ver respaldos disponibles:
```bash
ls -lh /home/z/backups/
```

### Ver log de respaldos:
```bash
cat /home/z/backups/backup.log
```

### Hacer un respaldo manual ahora:
```bash
/home/z/backups/backup-automatico.sh
```

### Verificar que el daemon está corriendo:
```bash
ps aux | grep iniciar-daemon-respaldo
```

---

## ⚠️ RESOLVER PROBLEMAS COMUNES

### Problema: La cámara no funciona

**Solución:**
1. Verifica que el navegador tiene permiso de cámara
2. Prueba con HTTPS si es necesario (la cámara requiere HTTPS o localhost)
3. Asegúrate que ningún otro app está usando la cámara

### Problema: No puedo escanear códigos

**Solución:**
1. Asegúrate que el producto tenga un código registrado
2. Mejora la iluminación
3. Mantén el código enfocado
4. Prueba con la cámara trasera (si es móvil)

### Problema: El stock no se actualiza

**Solución:**
1. Verifica que la venta se haya completado exitosamente
2. Revisa en **"Reportes"** → **"Ventas del día"**
3. Si no aparece, intenta de nuevo

### Problema: Los reportes no se imprimen

**Solución:**
1. Click en **"Imprimir"**
2. En el diálogo de impresión:
   - Selecciona tu impresora
   - Asegúrate que "Gráficos de fondo" esté activo
   - Click en "Imprimir"

### Problema: Perdí datos por error

**Solución:**
1. Ve a `/home/z/backups/`
2. Descomprime el respaldo más reciente:
   ```bash
   cd /home/z
   tar -xzf backups/proyecto-[FECHA].tar.gz
   ```
3. Copia la base de datos:
   ```bash
   cp backups/custom.db-[FECHA] my-project/db/custom.db
   ```
4. Reinicia la aplicación

---

## 📞 AYUDA Y SOPORTE

### Si tienes preguntas:

1. **Lee la documentación:**
   - `HISTORIAL_CHAT.md` - TODO lo que conversamos
   - `RESUMEN_FINAL.md` - Resumen completo
   - `PERSISTENCIA_DATOS.md` - Cómo funciona la persistencia
   - `DESPLEGUE_MULTI_DISPOSITIVOS.md` - Para múltiples tiendas

2. **Verifica los respaldos:**
   ```bash
   ls -lh /home/z/backups/
   ```

3. **Revisa el log:**
   ```bash
   tail -f /home/z/backups/backup.log
   ```

---

## ✅ CHECKLIST DIARIO

### Cada mañana:
- [ ] Verificar que el daemon de respaldos está corriendo
- [ ] Verificar que se creó un nuevo respaldo
- [ ] Revisar alertas de stock bajo
- [ ] Planificar compras del día si hay stock bajo

### Cada semana:
- [ ] Verificar tamaño de respaldos
- [ ] Copiar respaldos a computadora personal
- [ ] Revisar reportes de ventas
- [ ] Ajustar precios si es necesario

### Cada mes:
- [ ] Revisar reporte completo del mes
- [ ] Planificar inventario para el siguiente mes
- [ ] Respaldar manualmente antes de cambios grandes
- [ ] Actualizar proveedores y precios de costo

---

## 🎯 LISTO PARA EMPEZAR

### Sigue estos 5 pasos para empezar HOY:

1. ✅ **Copia los respaldos** a tu computadora personal (5 min)
2. ✅ **Inicia el daemon de respaldos automáticos** (1 min)
3. ✅ **Inicia la aplicación** con `bun run dev` (1 min)
4. ✅ **Agrega tus productos** en el módulo Inventario (30-60 min)
5. ✅ **Prueba una venta** en el módulo Ventas (5 min)

**Tiempo total:** ~45-75 minutos

**Resultado:** Aplicación funcionando, productos cargados, respaldos automáticos activados

---

## 🎉 CONCLUSIÓN

### Lo que tienes ahora:

✅ **Aplicación completa** de gestión de tienda (6 módulos)
✅ **Escáner de códigos** QR y barras
✅ **Persistencia automática** de carritos
✅ **Sistema de respaldos** automático cada 4 horas
✅ **Documentación completa** en 6 archivos MD
✅ **Primer respaldo** completado (351 MB)
✅ **Scripts de recuperación** listos
✅ **Guías de uso** detalladas

### Lo que DEBES hacer ahora:

1. 💾 **Copiar respaldos** a tu computadora personal HOY
2. 🔄 **Iniciar daemon** de respaldos automáticos HOY
3. 🚀 **Iniciar aplicación** con `bun run dev`
4. 📦 **Agregar productos** a tu inventario
5. 💰 **Empezar a vender** con tu nuevo POS

---

**¡ESTÁS LISTO PARA GESTIONAR TU TIENDA!** 🎯✨

**Copia este documento a tu computadora personal también, por seguridad.**
