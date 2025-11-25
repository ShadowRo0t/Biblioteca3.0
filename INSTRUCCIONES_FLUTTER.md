# Guía de ejecución (Flutter Web y Android)

## 1. Requisitos previos

- **Flutter SDK** 3.19 o superior (`flutter --version`)
- **Dart SDK** (se incluye con Flutter)
- **Chrome** instalado (para Flutter Web)
- **Android Studio** con:
  - Android SDK 33+
  - Un dispositivo virtual configurado (AVD) o un dispositivo físico
- **Node.js 18+** (para el backend Express)
- **MongoDB Community Server** ejecutándose en `mongodb://127.0.0.1:27017`

## 2. Preparar el backend

1. Abrir una terminal en `Biblioteca-main/Backend`.
2. Copiar o crear `.env`:

   ```env
   PORT=8000
   MONGODB_URI=mongodb://127.0.0.1:27017/biblioteca_bec
   JWT_SECRET=una_clave_segura
   ```

3. Instalar dependencias y poblar datos:

   ```bash
   npm install
   npm run seed   # crea usuarios de prueba y carga los libros iniciales
   ```

4. Levantar el servidor:

   ```bash
   npm run dev    # o npm start
   ```

   El backend queda disponible en `http://127.0.0.1:8000`.

## 3. Preparar Flutter

1. En otra terminal, ubicarse en `Biblioteca-main/Movil/biblioteca_flutter`.
2. Instalar dependencias:

   ```bash
   flutter pub get
   ```

3. Verificar dispositivos disponibles:

   ```bash
   flutter devices
   ```

## 4. Ejecutar en **Chrome** (Flutter Web)

1. Asegúrate de que el backend Express esté corriendo.
2. Ejecuta:

   ```bash
   flutter run -d chrome --dart-define=BACKEND_PORT=8000
   ```

   - `BACKEND_PORT` es opcional si usas el puerto por defecto (8000).
   - Si el backend estuviera en otra IP/puerto, añade `--dart-define=BACKEND_HOST=TU_IP`.

3. Flutter compilará para web y abrirá la app en una pestaña de Chrome.
4. Inicia sesión con las credenciales del seed (`admin@biblioteca.com / admin123` o `usuario@test.com / usuario123`) y prueba el catálogo.

## 5. Ejecutar en **Android (emulador AVD)**

1. Inicia el emulador desde Android Studio o con `emulator -avd NombreDelAVD`.
2. Comprueba que aparece en `flutter devices`.
3. Ejecuta:

   ```bash
   flutter run -d emulator-5554 --dart-define=BACKEND_PORT=8000
   ```

   - Reemplaza `emulator-5554` por el ID real que muestra `flutter devices`.
   - El código ya detecta el entorno Android y utiliza `http://10.0.2.2:8000/api`, que es la puerta de enlace al host desde el emulador.

4. Al finalizar la compilación, la app se instalará en el emulador. Usa las mismas credenciales que en web.

### Dispositivo Android físico

1. Conecta el teléfono por USB y activa la depuración.
2. Confirma que aparece con `flutter devices`.
3. Lanza la app definiendo la IP local del host (la de tu PC en la red):

   ```bash
   flutter run -d <ID_DISPOSITIVO> \
     --dart-define=BACKEND_HOST=192.168.0.10 \
     --dart-define=BACKEND_PORT=8000
   ```

4. Asegúrate de que el dispositivo y la PC estén en la misma red y que el firewall permita el puerto 8000.

## 6. Funcionalidades disponibles en Flutter

- **Catálogo en tiempo real**: consume `GET /api/libros`, muestra stock y evita reservas si no hay copias.
- **Reservas**: crea y cancela reservas mediante `/api/reservas`, replicando la lógica de Angular.
- **Gestionar libros (solo admin)**:
  - Crear títulos nuevos con imagen y stock inicial.
  - Añadir existencias a libros existentes.
  - Eliminar libros sin reservas activas.
- **Home adaptado al rol**: muestra accesos directos administrativos al iniciar sesión como `admin`.

## 7. Solución de problemas frecuentes

- **Error de conexión / Failed host lookup**:
  - Verifica que Express esté activo y accesible.
  - Comprueba la IP definida por `BACKEND_HOST` o la detección automática (`10.0.2.2` en emulador).
  - Confirma que MongoDB está en marcha.

- **401 / Token no proporcionado**:
  - El login no se completó o expiró el token. Cierra sesión y vuelve a ingresar.

- **Libros vacíos**:
  - Ejecuta `npm run seed` nuevamente.
  - Verifica que la colección `libros` contenga datos (`db.libros.find()` en MongoDB).

## 8. Resumen de encendido rápido

1. **Backend**: `cd Backend && npm install && npm run seed && npm run dev`
2. **Flutter**: `cd Movil/biblioteca_flutter && flutter pub get`
3. **Chrome**: `flutter run -d chrome`
4. **Android AVD**: abrir emulador y `flutter run -d emulator-XXXX`

Con esto, podrás usar la app móvil tanto en navegador como en emulador Android replicando todas las funciones disponibles en la versión web. ¡Listo para desarrollar y probar! 🚀

