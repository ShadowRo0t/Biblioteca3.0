#  Biblioteca BEC - Aplicación Flutter

Aplicación móvil de la Biblioteca BEC desarrollada con Flutter y Dart.

##  Características

-  **Autenticación**: Login y registro de usuarios
-  **Catálogo de libros**: Explorar y buscar libros disponibles
-  **Reservas**: Crear y gestionar reservas de libros
-  **Diseño móvil nativo**: Interfaz optimizada para dispositivos móviles
-  **Conexión con backend**: Integración con la API REST existente

##  Requisitos Previos

1. **Flutter SDK** (versión 3.0 o superior)
   - Descarga desde: https://flutter.dev/docs/get-started/install
   - Verifica la instalación: `flutter doctor`

2. **Backend corriendo**
   - El backend debe estar ejecutándose en `http://127.0.0.1:8000` o `http://localhost:8000`

3. **Editor de código** (opcional pero recomendado)
   - Android Studio / IntelliJ IDEA
   - VS Code con extensión Flutter

##  Instalación

1. **Navega a la carpeta del proyecto**:
   ```bash
   cd Biblioteca-main/Movil/biblioteca_flutter
   ```

2. **Instala las dependencias**:
   ```bash
   flutter pub get
   ```

3. **Verifica que todo esté correcto**:
   ```bash
   flutter doctor
   ```

##  Ejecutar la Aplicación

### En un Emulador/Simulador

1. **Inicia un emulador**:
   - Android: Abre Android Studio → AVD Manager → Inicia un dispositivo
   - iOS: Abre Xcode → Window → Devices and Simulators → Inicia un simulador

2. **Ejecuta la aplicación**:
   ```bash
   flutter run
   ```

### En un Dispositivo Físico

#### Android

1. **Habilita el modo desarrollador** en tu dispositivo Android
2. **Conecta el dispositivo** por USB
3. **Autoriza la depuración USB** cuando aparezca el diálogo
4. **Ejecuta**:
   ```bash
   flutter run
   ```

#### iOS

1. **Conecta tu iPhone/iPad** por USB
2. **Confía en la computadora** en el dispositivo
3. **Ejecuta**:
   ```bash
   flutter run
   ```

### Para Probar en Dispositivo Físico (Red Local)

Si quieres probar en un dispositivo físico conectado a la misma red WiFi:

1. **Encuentra tu IP local**:
   ```bash
   # Windows
   ipconfig
   # Busca "IPv4 Address" (ejemplo: 192.168.1.100)
   
   # Mac/Linux
   ifconfig
   # Busca "inet" (ejemplo: 192.168.1.100)
   ```

2. **Edita el archivo** `lib/services/api_service.dart`:
   ```dart
   // Cambia esta línea:
   static const String baseUrl = 'http://127.0.0.1:8000/api';
   
   // Por esta (usando tu IP):
   static const String baseUrl = 'http://192.168.1.100:8000/api';
   ```

3. **Asegúrate de que el backend acepte conexiones desde tu red local**

##  Estructura del Proyecto

```
lib/
├── main.dart                 # Punto de entrada de la aplicación
├── models/                   # Modelos de datos
│   ├── user.dart
│   ├── libro.dart
│   └── reserva.dart
├── services/                # Servicios para API y autenticación
│   ├── api_service.dart
│   ├── auth_service.dart
│   └── reserva_service.dart
├── screens/                 # Pantallas de la aplicación
│   ├── login_screen.dart
│   ├── register_screen.dart
│   ├── home_screen.dart
│   ├── catalogo_screen.dart
│   └── reservas_screen.dart
└── data/                    # Datos estáticos
    └── libros_data.dart
```

##  Características de Diseño

- **Material Design 3**: Usa el sistema de diseño más reciente de Material
- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Navegación fluida**: Usa GoRouter para navegación entre pantallas
- **Almacenamiento local**: Guarda el token y datos del usuario con SharedPreferences

##  Autenticación

La aplicación usa JWT (JSON Web Tokens) para autenticación:
- El token se guarda automáticamente al hacer login
- Se envía en cada petición al backend
- Se valida automáticamente en las rutas protegidas

##  API Endpoints Utilizados

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/reservas` - Obtener reservas del usuario
- `POST /api/reservas` - Crear nueva reserva
- `DELETE /api/reservas/:id` - Eliminar reserva

##  Solución de Problemas

### Error: "Unable to find a device"
- Asegúrate de que un emulador esté corriendo o un dispositivo esté conectado
- Ejecuta `flutter devices` para ver dispositivos disponibles

### Error: "Connection refused" o "Failed to connect"
- Verifica que el backend esté corriendo
- Verifica la URL en `api_service.dart`
- Si usas dispositivo físico, usa la IP local en lugar de localhost

### Error: "Package not found"
- Ejecuta `flutter pub get` nuevamente
- Verifica que `pubspec.yaml` esté correcto

### La app no se conecta al backend
- Verifica que el backend esté en el puerto 8000
- Si usas dispositivo físico, cambia `127.0.0.1` por tu IP local
- Verifica que el firewall no esté bloqueando la conexión

##  Build para Producción

### Android (APK)
```bash
flutter build apk --release
```
El APK estará en: `build/app/outputs/flutter-apk/app-release.apk`

### Android (App Bundle)
```bash
flutter build appbundle --release
```

### iOS
```bash
flutter build ios --release
```

##  Comandos Útiles

```bash
# Ver dispositivos disponibles
flutter devices

# Limpiar el proyecto
flutter clean

# Obtener dependencias
flutter pub get

# Actualizar dependencias
flutter pub upgrade

# Analizar el código
flutter analyze

# Formatear el código
flutter format .

# Ejecutar tests
flutter test
```

##  Notas

- Los libros están hardcoded en `lib/data/libros_data.dart`
- El token se guarda automáticamente en SharedPreferences
- La aplicación valida automáticamente la sesión al iniciar
- Las reservas se crean con 7 días de duración por defecto

##  Próximos Pasos

- [ ] Agregar pantalla de detalles del libro
- [ ] Implementar selección de fechas personalizadas
- [ ] Agregar notificaciones push
- [ ] Implementar caché de imágenes
- [ ] Agregar modo offline
- [ ] Implementar búsqueda avanzada

##  Licencia

Este proyecto es parte del sistema Biblioteca BEC.

