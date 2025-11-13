# 🚀 Instrucciones Rápidas - App Flutter

## ⚡ Inicio Rápido

### 1. Instalar Flutter
- Descarga desde: https://flutter.dev/docs/get-started/install
- Verifica: `flutter doctor`

### 2. Navegar al proyecto
```bash
cd Biblioteca-main/Movil/biblioteca_flutter
```

### 3. Instalar dependencias
```bash
flutter pub get
```

### 4. Asegurar que el backend esté corriendo
- El backend debe estar en `http://127.0.0.1:8000`

### 5. Ejecutar la app
```bash
flutter run
```

## 📱 Para Probar en Dispositivo Físico

1. **Conecta tu dispositivo** por USB
2. **Habilita depuración USB** en el dispositivo
3. **Ejecuta**: `flutter run`

### Si el backend no se conecta desde el dispositivo:

1. **Encuentra tu IP local**:
   ```bash
   # Windows
   ipconfig
   # Mac/Linux  
   ifconfig
   ```

2. **Edita** `lib/services/api_service.dart`:
   ```dart
   // Cambia:
   static const String baseUrl = 'http://127.0.0.1:8000/api';
   
   // Por (usando tu IP):
   static const String baseUrl = 'http://TU_IP:8000/api';
   ```

## ✅ Estructura Creada

- ✅ Modelos (User, Libro, Reserva)
- ✅ Servicios (API, Auth, Reserva)
- ✅ Pantallas (Login, Register, Home, Catálogo, Reservas)
- ✅ Navegación con GoRouter
- ✅ Almacenamiento local
- ✅ Diseño móvil nativo

## 🎯 Funcionalidades Implementadas

- ✅ Login y registro
- ✅ Catálogo de libros con búsqueda
- ✅ Crear reservas
- ✅ Ver mis reservas
- ✅ Cancelar reservas
- ✅ Validación de formularios
- ✅ Manejo de errores
- ✅ Diseño responsive

¡La aplicación está lista para ejecutarse! 🎉

