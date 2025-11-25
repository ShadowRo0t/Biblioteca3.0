#  Instrucciones para Ejecutar la Aplicación React (Versión Móvil/Web)

##  ¿Qué es esta aplicación?

Esta es una **aplicación React** que funciona como una **aplicación web** en el navegador. Es una versión alternativa de la biblioteca, diseñada con React en lugar de Angular.

##  Requisitos Previos

1. **Node.js** instalado (versión 14 o superior)
2. **Backend corriendo** en `http://localhost:8000` o `http://127.0.0.1:8000`

##  Pasos para Ejecutar

### Paso 1: Asegúrate de que el Backend esté Corriendo

El backend debe estar ejecutándose en el puerto 8000. Si no está corriendo:

```bash
# Navega a la carpeta del backend
cd Biblioteca-main/Backend

# Inicia el servidor
node server.js
```

### Paso 2: Navega a la Carpeta de la Aplicación React

```bash
cd Biblioteca-main/Movil/biblioteca-bec-
```

### Paso 3: Instala las Dependencias (si es necesario)

```bash
npm install
```

### Paso 4: Inicia la Aplicación

```bash
npm start
```

### Paso 5: Abre tu Navegador

La aplicación se abrirá automáticamente en:
- **URL**: `http://localhost:3000`

Si no se abre automáticamente, abre tu navegador y ve a esa dirección.

##  Funcionalidades

La aplicación React incluye:

-  **Login/Registro** de usuarios
-  **Catálogo de libros** (hardcoded en el código)
-  **Crear reservas** de libros
-  **Ver mis reservas**
-  **Cancelar reservas**

##  Configuración de la API

La aplicación está configurada para conectarse al backend en:
- **URL**: `http://localhost:8000/api`

Si tu backend está en otra dirección, edita el archivo:
- `src/App.js` (línea 4)
- Cambia: `const API_URL = 'http://localhost:8000/api';`

##  Diferencias con la Versión Angular

| Característica | Versión Angular | Versión React (Movil) |
|---------------|----------------|----------------------|
| Framework | Angular | React |
| Puerto | Configurado en Angular | Puerto 3000 |
| Estructura | Componentes Angular | Componentes React |
| Estado | Services + RxJS | useState/useEffect |
| Routing | Angular Router | Estado interno (screen) |

##  Solución de Problemas

### Error: "No se pudo conectar al servidor"
- Verifica que el backend esté corriendo en el puerto 8000
- Verifica que la URL de la API sea correcta

### Error: "Cannot find module"
- Ejecuta `npm install` nuevamente

### Puerto 3000 ya está en uso
- Cierra otras aplicaciones que usen el puerto 3000
- O cambia el puerto editando `package.json` o usando:
  ```bash
  PORT=3001 npm start
  ```

##  Notas Importantes

1. **Los libros están hardcoded** en el código (líneas 124-182 de App.js)
2. **El token se guarda** en `localStorage` con la clave `'token'`
3. **El usuario se guarda** en `localStorage` con la clave `'user'`
4. La aplicación usa el **mismo backend** que la versión Angular

##  Comandos Disponibles

```bash
# Iniciar en modo desarrollo
npm start

# Crear build de producción
npm run build

# Ejecutar tests
npm test

# Eyectar configuración (irreversible)
npm run eject
```

##  ¿Es realmente una App Móvil?

Aunque está en la carpeta "Movil", esta es una **aplicación web React** que se ejecuta en el navegador. Para convertirla en una app móvil real, necesitarías:

- **React Native** (para apps nativas)
- **Ionic** (para apps híbridas)
- **Cordova/PhoneGap** (para empaquetar la web como app)

Por ahora, funciona perfectamente como una **aplicación web** en el navegador.

