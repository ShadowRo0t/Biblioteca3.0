# 📱 Cómo Emular Vista Móvil en el Navegador

Esta guía te mostrará cómo ver la aplicación React como si estuviera en un dispositivo móvil usando las herramientas de desarrollador del navegador.

## 🎯 Método 1: Herramientas de Desarrollador (Recomendado)

### En Google Chrome / Microsoft Edge

1. **Abre la aplicación** en el navegador:
   - Ejecuta `npm start` en la terminal
   - Abre `http://localhost:3000`

2. **Abre las DevTools**:
   - Presiona `F12` o `Ctrl + Shift + I` (Windows/Linux)
   - O `Cmd + Option + I` (Mac)
   - O haz clic derecho → "Inspeccionar"

3. **Activa el modo dispositivo**:
   - Presiona `Ctrl + Shift + M` (Windows/Linux)
   - O `Cmd + Shift + M` (Mac)
   - O haz clic en el ícono de dispositivo móvil (📱) en la barra de herramientas

4. **Selecciona un dispositivo**:
   - En la parte superior, verás un menú desplegable
   - Selecciona un dispositivo predefinido:
     - **iPhone 12 Pro** (390 x 844)
     - **iPhone SE** (375 x 667)
     - **Samsung Galaxy S20** (360 x 800)
     - **iPad** (768 x 1024)
     - O crea un tamaño personalizado

5. **Ajusta la orientación**:
   - Haz clic en el ícono de rotación para cambiar entre vertical y horizontal

### En Mozilla Firefox

1. **Abre la aplicación** en Firefox

2. **Abre las DevTools**:
   - Presiona `F12` o `Ctrl + Shift + I`

3. **Activa el modo responsive**:
   - Presiona `Ctrl + Shift + M`
   - O haz clic en el ícono de dispositivo móvil

4. **Selecciona un tamaño**:
   - Usa el menú desplegable para elegir un dispositivo
   - O ingresa dimensiones personalizadas

### En Safari (Mac)

1. **Habilita el menú de desarrollo**:
   - Safari → Preferencias → Avanzado
   - Marca "Mostrar menú de desarrollo en la barra de menú"

2. **Abre la aplicación** en Safari

3. **Activa el modo responsive**:
   - Desarrollo → Entrar en modo de diseño responsivo
   - O `Cmd + Option + R`

## 🎨 Método 2: Forzar Vista Móvil con CSS (Opcional)

Si quieres que la aplicación siempre se vea como un móvil incluso en pantallas grandes, puedes descomentar el código en `App.css`:

```css
/* En src/App.css, busca estas líneas y descoméntalas: */
body {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #333;
}

#root {
  width: 100%;
  max-width: 414px; /* Ancho típico de un iPhone */
  margin: 0 auto;
  background: white;
  min-height: 100vh;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}
```

## 📐 Tamaños de Dispositivos Comunes

| Dispositivo | Ancho | Alto |
|------------|-------|------|
| iPhone SE | 375px | 667px |
| iPhone 12/13 | 390px | 844px |
| iPhone 12 Pro Max | 428px | 926px |
| Samsung Galaxy S20 | 360px | 800px |
| Samsung Galaxy S21 | 360px | 800px |
| iPad | 768px | 1024px |
| iPad Pro | 1024px | 1366px |

## 🔧 Características del Modo Móvil en DevTools

Cuando activas el modo dispositivo, puedes:

- ✅ **Simular diferentes dispositivos** y sus dimensiones
- ✅ **Cambiar la orientación** (vertical/horizontal)
- ✅ **Simular conexiones lentas** (3G, 4G, etc.)
- ✅ **Ver el viewport** en tiempo real
- ✅ **Probar touch events** (si tu navegador lo soporta)
- ✅ **Ver el zoom** y comportamiento táctil

## 🚀 Pasos Rápidos (Resumen)

1. Ejecuta `npm start`
2. Abre `http://localhost:3000`
3. Presiona `F12` para abrir DevTools
4. Presiona `Ctrl + Shift + M` para modo móvil
5. Selecciona un dispositivo del menú
6. ¡Listo! La app se verá como en un móvil

## 💡 Consejos

- **Actualiza la página** después de cambiar el tamaño del dispositivo
- **Prueba diferentes dispositivos** para ver cómo se adapta
- **Usa la barra de herramientas** para rotar, cambiar zoom, etc.
- **Prueba en diferentes navegadores** para verificar compatibilidad

## 📱 Probar en un Dispositivo Real

Si quieres probar en un dispositivo móvil real:

1. **Asegúrate de que tu computadora y móvil estén en la misma red WiFi**

2. **Encuentra tu IP local**:
   ```bash
   # Windows
   ipconfig
   # Busca "IPv4 Address" (ejemplo: 192.168.1.100)
   
   # Mac/Linux
   ifconfig
   # Busca "inet" (ejemplo: 192.168.1.100)
   ```

3. **Inicia la app con la IP**:
   ```bash
   # En lugar de localhost, usa tu IP
   # Edita package.json o usa:
   HOST=0.0.0.0 npm start
   ```

4. **En tu móvil**, abre el navegador y ve a:
   ```
   http://TU_IP:3000
   ```
   Ejemplo: `http://192.168.1.100:3000`

## 🎯 Atajos de Teclado Útiles

| Acción | Windows/Linux | Mac |
|--------|---------------|-----|
| Abrir DevTools | `F12` o `Ctrl + Shift + I` | `Cmd + Option + I` |
| Modo Móvil | `Ctrl + Shift + M` | `Cmd + Shift + M` |
| Cerrar DevTools | `F12` o `Ctrl + Shift + I` | `Cmd + Option + I` |
| Actualizar | `F5` o `Ctrl + R` | `Cmd + R` |

¡Ahora puedes probar tu aplicación como si estuviera en un móvil! 📱✨

