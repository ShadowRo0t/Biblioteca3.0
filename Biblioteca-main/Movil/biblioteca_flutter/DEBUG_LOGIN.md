# 🐛 Debug: Problema de Navegación después del Login

## Problema
Después de hacer login exitoso, la aplicación no navega a `/home` y se queda en la pantalla de login.

## Logs a Revisar

Cuando ejecutes la aplicación y hagas login, revisa la **consola del navegador** (F12 → Console) y busca estos mensajes:

### 1. Durante el Login
- `🔐 Respuesta del login:` - Debe mostrar `{success: true, data: {...}}`
- `📦 Datos recibidos:` - Debe mostrar el objeto con `token` y `user`
- `💾 Token guardado:` - Debe mostrar `true`
- `✅ Token verificado:` - Debe mostrar `Sí`
- `🔑 Token guardado:` - Debe mostrar `Sí`
- `🔑 Token verificado después del delay:` - Debe mostrar `Sí`
- `➡️ Navegando a /home` - Debe aparecer

### 2. Durante el Redirect
- `🔍 Redirect check - isLoggedIn:` - Debe mostrar `true` después del login
- `✅ Sin redirección necesaria` o `➡️ Redirigiendo a /home`

## Posibles Causas

### 1. Token no se guarda en SharedPreferences
**Síntoma**: Los logs muestran `Token guardado: false` o `Token verificado: No`

**Solución**: En Flutter Web, SharedPreferences usa localStorage. Verifica en la consola del navegador:
- F12 → Application → Local Storage → `http://localhost:XXXX`
- Busca la clave `flutter.auth_token`

### 2. Redirect interfiere con la navegación
**Síntoma**: Los logs muestran que navega a `/home` pero luego redirige de vuelta a `/login`

**Solución**: El redirect está verificando `isLoggedIn()` antes de que SharedPreferences se actualice.

### 3. Problema con la respuesta del backend
**Síntoma**: Los logs muestran `Login fallido` o `Token no encontrado en la respuesta`

**Solución**: Verifica que el backend devuelva:
```json
{
  "token": "...",
  "user": {
    "id": "...",
    "name": "...",
    "email": "..."
  }
}
```

## Solución Temporal

Si el problema persiste, puedes deshabilitar temporalmente el redirect:

En `lib/main.dart`, comenta el `redirect`:

```dart
final GoRouter _router = GoRouter(
  initialLocation: '/login',
  routes: [
    // ... rutas
  ],
  // redirect: (context, state) async {
  //   // ... código comentado
  // },
);
```

Esto permitirá que la navegación manual funcione sin interferencias.

## Verificación Manual

1. Abre la consola del navegador (F12)
2. Intenta hacer login
3. Copia todos los logs que aparezcan
4. Compártelos para diagnosticar el problema

