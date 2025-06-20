# 🧪 CHECKLIST DE TESTING - SISTEMA UTC
## Página de Detalle de Servicio (DetalleServicio.js)

### 📅 **CASOS DE USO - FECHAS UTC**

#### ✅ **1. Verificación de Fecha Mínima**
- [X] **Al cargar la página**: Verificar que no se puede seleccionar fechas pasadas en UTC
- [X] **Cambio de día UTC**: Si son las 21:00 Argentina (00:00 UTC+1), verificar que "ayer" esté bloqueado
- [X] **Logs en consola**: Verificar que `Fecha mínima UTC` y `Fecha mínima para DatePicker` sean correctas

#### ✅ **2. Selección de Fechas**
- [X] **Fecha actual UTC**: Debe poder seleccionar "hoy" en UTC
- [X] **Fechas futuras**: Debe poder seleccionar cualquier fecha futura
- [X] **Reset de horarios**: Al cambiar fecha, los horarios se resetean automáticamente

#### ✅ **3. Horarios Disponibles**
- [X] **Carga de horarios**: Verificar que el fetch a `/real-availability` funcione
- [ ] **Fecha enviada en UTC**: Log `Fecha seleccionada (UTC)` debe ser formato YYYY-MM-DD
- [X] **Horarios vacíos**: Si no hay horarios, mostrar mensaje apropiado
- [X] **Estado de carga**: Mostrar "Cargando horarios..." mientras busca

### ⏰ **CASOS DE USO - HORARIOS UTC**

#### ✅ **4. Validación de Horarios Pasados**
- [X] **Día actual**: Si seleccionas "hoy", horarios pasados en UTC deben estar deshabilitados
- [X] **Horarios futuros**: Horarios futuros en UTC deben estar disponibles
- [X] **Logs de comparación**: Verificar logs `Comparando bloque X con ahora Y - Deshabilitado: Z`
- [X] **Estilos visuales**: Horarios deshabilitados deben tener fondo gris y cursor "not-allowed"

#### ✅ **5. Selección de Horarios**
- [X] **Click en horario disponible**: Debe seleccionarse y cambiar estilo visual
- [X] **Click en horario deshabilitado**: No debe hacer nada
- [X] **Tooltip informativos**: Hover debe mostrar "Este horario ya pasó" para horarios deshabilitados
- [X] **Cambio de selección**: Debe poder cambiar entre horarios disponibles

### 🛡️ **CASOS DE USO - ROLES Y PERMISOS**

#### ✅ **6. Usuario Entrenador**
- [X] **Calendario deshabilitado**: No debe poder seleccionar fechas
- [X] **Mensaje de restricción**: Mostrar "Los entrenadores no pueden reservar servicios"
- [X] **Botón deshabilitado**: Botón de reserva debe mostrar "No puedes reservar"
- [X] **Horarios ocultos**: No debe mostrar horarios disponibles

#### ✅ **7. Usuario Cliente**
- [X] **Calendario habilitado**: Debe poder seleccionar fechas
- [X] **Horarios visibles**: Debe ver horarios disponibles
- [X] **Botón habilitado**: Botón debe estar activo cuando seleccione fecha y horario
- [X] **Proceso de reserva**: Debe poder proceder al pago

### 💳 **CASOS DE USO - RESERVA Y PAGO**

#### ✅ **8. Validación de Reserva**
- [X] **Fecha y horario obligatorios**: Botón deshabilitado sin selección completa
- [ ] **Fecha UTC correcta**: Log `Fecha y hora enviada a la reserva (UTC)` debe ser correcto
- [ ] **Formato ISO**: Fecha debe enviarse como ISO string en UTC
- [X] **Estado de carga**: Mostrar "Procesando..." durante la reserva

#### ✅ **9. Manejo de Errores**
- [X] **Reserva duplicada**: Mostrar alerta si ya existe reserva para esa fecha/hora
- [ ] **Error de red**: Manejar errores de conexión apropiadamente
- [ ] **Respuesta inválida**: Manejar respuestas no esperadas del backend
- [ ] **Reset de estado**: `setBookingLoading(false)` en todos los casos de error

### 🌍 **CASOS DE USO - ZONAS HORARIAS**

#### ✅ **10. Diferentes Zonas Horarias**
- [X] **Argentina (UTC-3)**: Tu caso actual - verificar funcionamiento

#### ✅ **11. Cambios de Horario**
- [X] **Fin de año**: Transición 31 dic → 1 ene en UTC
- [X] **Fin de mes**: Casos límite de cambio de mes
- [ ] **Leap year**: Verificar 29 de febrero en años bisiestos

### 🔧 **CASOS DE USO - TÉCNICOS**

#### ✅ **12. Rendimiento y UX**
- [X] **Carga inicial**: Página debe cargar en < 3 segundos
- [X] **Responsive**: Funcionar en móvil, tablet, desktop
- [ ] **Estados de carga**: Indicadores visuales durante operaciones async

#### ✅ **13. Logs y Debug**
- [X] **Consola limpia**: No errores JavaScript en consola
- [X] **Logs informativos**: Todos los logs de UTC funcionando
- [ ] **Network tab**: Requests a APIs funcionando correctamente
- [ ] **Performance**: No memory leaks o renders innecesarios

### 🧩 **CASOS DE USO - INTEGRACIÓN**

#### ✅ **14. Backend Integration**
- [ ] **API de servicio**: `/api/service/:id` retorna datos correctos
- [ ] **API de disponibilidad**: `/api/service/:id/real-availability` funciona
- [ ] **API de pago**: `/api/payment/create-checkout-session` funciona
- [ ] **Autenticación**: Headers y tokens correctos

#### ✅ **15. Estado de la Aplicación**
- [ ] **LocalStorage**: Lectura correcta de user y role
- [ ] **Navigation**: Parámetros de URL correctos (:id)
- [ ] **State management**: Estados React consistentes
- [ ] **Memory management**: No memory leaks en useEffect

### 📱 **CASOS DE USO - UI/UX**

#### ✅ **16. Información del Servicio**
- [X] **Título del servicio**: Se muestra correctamente
- [X] **Precio formateado**: Formato argentino con separadores de miles
- [X] **Categoría y duración**: Se muestran en el encabezado
- [X] **Descripción**: Se muestra o fallback "Sin descripción detallada"
- [X] **Modalidad**: "Presencial" o "Virtual" según corresponda
- [X] **Datos del entrenador**: Nombre y apellido del entrenador

#### ✅ **17. Calendario DatePicker**
- [X] **Idioma español**: Días y meses en español
- [X] **Formato de fecha**: dd/MM/yyyy
- [X] **Inicio de semana**: Lunes como primer día
- [X] **Fechas deshabilitadas**: Fechas pasadas no seleccionables
- [X] **Navegación**: Poder navegar entre meses

#### ✅ **18. Grid de Horarios**
- [ ] **Layout responsivo**: Grid de 2 columnas
- [X] **Iconos**: Emoji de calendario en cada botón
- [X] **Estados visuales**: Disponible, seleccionado, deshabilitado
- [ ] **Formato de hora**: HH:mm o HH:mm:00 según longitud
- [X] **Tooltips**: Mensajes informativos en hover

### 🚨 **CASOS DE USO - EDGE CASES**

#### ✅ **19. Casos Límite de Datos**
- [X] **Sin horarios disponibles**: Mensaje explicativo


#### ✅ **20. Casos Límite de Horarios**
- [ ] **Último horario del día**: 23:00, 23:30, etc.
- [ ] **Primer horario del día**: 00:00, 00:30, etc.
- [ ] **Horarios con minutos**: 10:30, 14:45, etc.
- [ ] **Servicios de diferentes duraciones**: 30min, 45min, 60min, 90min
- [ ] **Múltiples franjas**: Mañana y tarde separadas

#### ✅ **21. Casos Límite de Fechas**
- [X] **Cambio de mes**: 31 enero → 1 febrero
- [ ] **Año bisiesto**: 29 febrero 2024
- [X] **Cambio de año**: 31 diciembre → 1 enero
- [ ] **Horario de verano**: Cambios DST
- [ ] **Fechas muy futuras**: Meses adelante

---

## 🚀 **TESTING RAPIDO - 5 MINUTOS**

### Pasos mínimos para verificar funcionamiento:

1. **Abrir DevTools** (F12) → Console tab
2. **Ir a página de servicio** → Ver logs de fecha mínima
3. **Intentar seleccionar ayer** → Debe estar bloqueado
4. **Seleccionar hoy** → Ver logs de conversión UTC
5. **Seleccionar horario** → Ver logs de comparación
6. **Intentar reservar** → Ver log de fecha final UTC

### ✅ **CRITERIO DE ÉXITO**
Todos los logs deben mostrar fechas y horarios en UTC correctamente, sin errores en consola.

---

## 📝 **NOTAS DE TESTING**

### Para probar diferentes zonas horarias:
1. Cambiar zona horaria del sistema
2. Usar DevTools → Settings → Sensors → Location
3. Usar navegador con VPN en diferentes países

### Para probar casos límite:
1. Cambiar hora del sistema a 23:59
2. Recargar página y verificar cambio de día
3. Usar fechas específicas como 29/02, 31/12, etc.

### Herramientas útiles:
- **Logs en consola**: Todos los casos están loggeados
- **Network tab**: Ver requests/responses
- **React DevTools**: Verificar estados
- **Date utilities**: Usar Date.now(), new Date().toISOString()

---

## 🎯 **PRIORIDADES DE TESTING**

### **🔴 CRÍTICO (Probar SIEMPRE):**
1. Fechas pasadas bloqueadas en UTC
2. Horarios pasados deshabilitados en UTC
3. Restricciones de rol (entrenador vs cliente)
4. Proceso de reserva y pago

### **🟡 IMPORTANTE (Probar frecuentemente):**
1. Diferentes zonas horarias
2. Casos límite de fechas
3. Estados de carga y errores
4. UI responsiva

### **🟢 NICE TO HAVE (Probar ocasionalmente):**
1. Rendimiento en dispositivos lentos
2. Accesibilidad completa
3. Casos extremos de datos
4. Navegadores antiguos