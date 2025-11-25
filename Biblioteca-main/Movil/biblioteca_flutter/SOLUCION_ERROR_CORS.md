#  Solución al Error de CORS en Flutter Web

##  Error que estás viendo

```
Error de conexión: ClientException: Failed to fetch, uri=http://127.0.0.1:8000/api/auth/login
```

##  Soluciones Aplicadas

### 1. **Actualización del Backend (CORS)**

He actualizado el archivo `Backend/server.js` para permitir múltiples orígenes:

-  `http://localhost:4200` (Angular)
-  `http://localhost:3000` (React)
-  `http://localhost:8080` (Flutter Web común)
-  `http://localhost:5000` (Flutter Web alternativo)
-  Y sus variantes con `127.0.0.1`

### 2. **Actualización del Servicio API en Flutter**

He actualizado `lib/services/api_service.dart` para:
-  Usar `localhost` en lugar de `127.0.0.1` cuando se ejecuta en web
-  Detectar automáticamente si está en web o móvil
-  Mostrar mensajes de error más claros

##  Pasos para Solucionar

### Paso 1: Reiniciar el Backend

**IMPORTANTE**: Debes reiniciar el servidor backend para que los cambios de CORS surtan efecto.

```bash
# Detén el backend (Ctrl+C)
# Luego inícialo nuevamente:
cd Biblioteca-main/Backend
node server.js
```

### Paso 2: Verificar que el Backend esté Corriendo

Abre en tu navegador:
- http://localhost:8000
- Deberías ver un JSON con información de la API

### Paso 3: Ejecutar Flutter Web

```bash
cd Biblioteca-main/Movil/biblioteca_flutter
flutter run -d chrome
```

O simplemente:
```bash
flutter run
```
Y selecciona Chrome cuando te pregunte.

##  Verificación

1. **Abre la consola del navegador** (F12)
2. **Intenta hacer login**
3. **Verifica que no haya errores de CORS** en la consola

##  Si Aún Tienes Problemas

### Opción 1: Verificar el Puerto de Flutter Web

Cuando ejecutas `flutter run`, Flutter te mostrará en qué puerto se está ejecutando. Si es diferente a los permitidos, agrega ese puerto al backend.

Ejemplo: Si Flutter se ejecuta en `http://localhost:12345`, agrega ese puerto a `server.js`:

```javascript
const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:5000',
  'http://localhost:12345',  // ← Agrega este
  // ...
];
```

### Opción 2: Permitir Todos los Orígenes (Solo Desarrollo)

Si quieres permitir todos los orígenes en desarrollo, cambia en `server.js`:

```javascript
app.use(cors({
  origin: true,  // Permite todos los orígenes
  credentials: true,
}));
```

** ADVERTENCIA**: Solo usa esto en desarrollo, nunca en producción.

### Opción 3: Verificar que el Backend Acepte Conexiones

Asegúrate de que el backend esté escuchando en todas las interfaces:

```javascript
app.listen(PORT, '0.0.0.0', () => {
  // ...
});
```

##  Cambios Realizados

1.  **Backend**: Configuración CORS actualizada para múltiples orígenes
2.  **Flutter**: Detección automática de plataforma (web vs móvil)
3.  **Flutter**: Uso de `localhost` en web (mejor para CORS)
4.  **Flutter**: Mensajes de error mejorados

##  Resultado Esperado

Después de reiniciar el backend, deberías poder:
-  Hacer login sin errores de CORS
-  Registrar nuevos usuarios
-  Ver el catálogo
-  Crear reservas
-  Ver tus reservas

¡Prueba ahora y debería funcionar! 

