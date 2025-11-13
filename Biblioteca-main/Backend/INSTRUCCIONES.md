# Guía de instalación y uso

## Requisitos previos

- **Node.js** 18 LTS o superior (incluye `npm`)
- **MongoDB Community Server** en ejecución local (`mongodb://127.0.0.1:27017`)
- Opcional, pero recomendado: **Git** y **MongoDB Compass**

## Instalación de dependencias

```bash
# Backend (Express + MongoDB)
cd Backend
npm install

# Frontend (Angular 17+)
cd ../
npm install
```

> Nota: Todos los comandos se ejecutan desde el directorio `Biblioteca-main` salvo que se indique lo contrario.

## Variables de entorno

En `Backend/` crea un archivo `.env` (si no existe) con al menos:

```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/biblioteca_bec
JWT_SECRET=una_clave_segura
```

## Poblar la base de datos

Para cargar usuarios de prueba, libros iniciales y dejar la base limpia:

```bash
cd Backend
npm run seed
```

- Admin: `admin@biblioteca.com / admin123`
- Usuario estándar: `usuario@test.com / usuario123`

## Ejecutar el backend

```bash
cd Backend
npm run dev      # con reinicios automáticos (nodemon)
# o
npm start        # ejecución normal
```

El servidor quedará disponible en `http://127.0.0.1:8000`.

### Endpoints destacados

| Método | Ruta                        | Descripción                                   | Auth |
|--------|----------------------------|-----------------------------------------------|------|
| POST   | `/api/auth/register`       | Crea una cuenta de usuario                    | No   |
| POST   | `/api/auth/login`          | Inicia sesión y devuelve JWT + datos de rol   | No   |
| GET    | `/api/libros`              | Lista todos los libros                        | No   |
| POST   | `/api/libros`              | Crea un libro nuevo                           | Sí (admin) |
| PATCH  | `/api/libros/:id/stock`    | Añade existencias a un libro                  | Sí (admin) |
| DELETE | `/api/libros/:id`          | Elimina un libro sin reservas activas         | Sí (admin) |
| GET    | `/api/reservas`            | Lista reservas del usuario autenticado        | Sí (usuario/admin) |
| POST   | `/api/reservas`            | Crea una reserva (descuenta stock)            | Sí (usuario/admin) |
| DELETE | `/api/reservas/:id`        | Cancela una reserva y devuelve stock          | Sí (usuario/admin) |

## Ejecutar el frontend

```bash
# desde Biblioteca-main
npm start
```

Angular se levanta en `http://127.0.0.1:4200`.

## Flujo recomendado

1. **Registro/Login**  
   - Crea una cuenta nueva (queda almacenada en MongoDB) o usa las credenciales del seed.

2. **Catálogo** (`/catalogo`)  
   - Carga en vivo la colección `libros`.
   - Solo permite reservar si hay stock disponible; al reservar se descuenta una copia y el estado pasa a “Agotado” cuando corresponde.

3. **Panel Admin** (`/admin`)  
   - Accesible únicamente con usuarios `role = admin`.
   - `Gestionar libros`: crear libros, añadir stock, eliminar (si no tiene reservas activas).

4. **Reservas** (`/prestamos`)  
   - Visualiza y cancela reservas propias.
   - Al cancelar, se devuelve el stock al libro.

## Consejos útiles

- **Orden de arranque**: inicia MongoDB → backend → frontend.
- **Resolver 403/401**: asegúrate de enviar el token JWT (guardado en `localStorage` tras login).
- **Actualizar catálogo**: al crear, editar o eliminar libros desde el panel admin, el catálogo se actualiza en la siguiente carga o tras reservar.
- **Ambiente limpio**: vuelve a ejecutar `npm run seed` cuando necesites restablecer la base a su estado inicial.

Con esto tendrás el proyecto funcionando.

