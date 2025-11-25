import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:8000/api';

function App() {
  const [screen, setScreen] = useState('login');
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados para formularios
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Estados para datos
  const [libros, setLibros] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  // Verificar si hay token guardado
  const checkAuth = () => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setScreen('home');
    }
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setScreen('home');
        alert('¡Bienvenido!');
      } else {
        alert(data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      alert('No se pudo conectar al servidor. Asegúrate de que el backend esté corriendo.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Registro
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('Completa todos los campos');
      return;
    }

    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        alert(' Cuenta creada exitosamente. Ahora inicia sesión');
        setScreen('login');
        setName('');
        setPassword('');
      } else {
        alert(data.message || 'Error al registrar');
      }
    } catch (error) {
      alert('No se pudo conectar al servidor');
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setEmail('');
    setPassword('');
    setScreen('login');
  };

  // Cargar catálogo de libros
  const loadLibros = () => {
    const librosData = [
      {
        id: 1,
        titulo: 'Cien años de soledad',
        autor: 'Gabriel García Márquez',
        genero: 'Novela',
        disponibilidad: 'Disponible',
        imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT40DdhptlKmZrqWs42vaYh5q8dDTYqSjac2g&s'
      },
      {
        id: 2,
        titulo: 'Don Quijote de la Mancha',
        autor: 'Miguel de Cervantes',
        genero: 'Narrativo',
        disponibilidad: 'Agotado',
        imagen: 'https://www.elejandria.com/covers/Don_Quijote_de_la_Mancha-Cervantes_Miguel-lg.png'
      },
      {
        id: 3,
        titulo: 'El Principito',
        autor: 'Antoine de Saint-Exupéry',
        genero: 'Infantil',
        disponibilidad: 'Disponible',
        imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGS4EXMwDImmp1Hi_uCZebMn8bCVnF6JPyww&s'
      },
      {
        id: 4,
        titulo: 'Crepúsculo',
        autor: 'Stephenie Meyer',
        genero: 'Fantasía',
        disponibilidad: 'Disponible',
        imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp80W-_ySBHlkvUtqDeOpwfYok3oSG9uY7qw&s'
      },
      {
        id: 5,
        titulo: 'La Odisea',
        autor: 'Homero',
        genero: 'Épico',
        disponibilidad: 'Disponible',
        imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-do1cARnM5ZjqdKeSUiaUpqTzrkRVOWEfpg&s'
      },
      {
        id: 7,
        titulo: 'Papelucho detective',
        autor: 'Marcela Paz',
        genero: 'Ficción',
        disponibilidad: 'Disponible',
        imagen: 'https://dojiw2m9tvv09.cloudfront.net/82626/product/asdsdsfasdasd3465.png'
      },
      {
        id: 8,
        titulo: 'Diario de Ana Frank',
        autor: 'Ana Frank',
        genero: 'Biografía',
        disponibilidad: 'Disponible',
        imagen: 'https://www.antartica.cl/media/catalog/product/9/7/9789878354194_1.png'
      }
    ];
    setLibros(librosData);
    setScreen('catalogo');
  };

  // Cargar reservas del usuario
  const loadReservas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reservas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setReservas(data);
        setScreen('reservas');
      } else {
        alert(data.message || 'Error al cargar reservas');
      }
    } catch (error) {
      alert('No se pudo conectar al servidor');
      console.error('Load reservas error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Crear reserva
  const crearReserva = async (libroId, libroTitulo) => {
    const hoy = new Date();
    const futuro = new Date();
    futuro.setDate(hoy.getDate() + 7);

    const desde = hoy.toISOString().split('T')[0];
    const hasta = futuro.toISOString().split('T')[0];

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reservas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          libro_id: libroId,
          tipo: 'prestamo',
          desde,
          hasta
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(` Reserva creada para "${libroTitulo}" (7 días)`);
        loadReservas();
      } else {
        alert(data.message || 'Error al crear reserva');
      }
    } catch (error) {
      alert('No se pudo conectar al servidor');
      console.error('Create reserva error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cancelar reserva
  const cancelarReserva = async (reservaId, libroTitulo) => {
    if (!window.confirm(`¿Deseas cancelar la reserva de "${libroTitulo}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reservas/${reservaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert(' Reserva cancelada');
        loadReservas();
      } else {
        alert('No se pudo cancelar la reserva');
      }
    } catch (error) {
      alert('No se pudo conectar al servidor');
      console.error('Cancel reserva error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar libros por búsqueda
  const librosFiltrados = libros.filter(libro =>
    libro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    libro.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    libro.genero.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==================== PANTALLAS ====================

  // Pantalla de Login
  const LoginScreen = () => (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1> Biblioteca BEC</h1>
          <p>Iniciar Sesión</p>
        </div>
        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
          <button type="submit" disabled={loading} className="button primary">
            {loading ? 'Cargando...' : 'Entrar'}
          </button>
          <button
            type="button"
            onClick={() => setScreen('register')}
            className="button secondary"
          >
            ¿No tienes cuenta? Regístrate
          </button>
        </form>
        <div className="test-users">
          <p><strong> Usuarios de prueba:</strong></p>
          <p>usuario@test.com / usuario123</p>
          <p>admin@biblioteca.com / admin123</p>
        </div>
      </div>
    </div>
  );

  // Pantalla de Registro
  const RegisterScreen = () => (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1> Biblioteca BEC</h1>
          <p>Crear Cuenta</p>
        </div>
        <form onSubmit={handleRegister} className="auth-form">
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />
          <input
            type="password"
            placeholder="Contraseña (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            className="input"
          />
          <button type="submit" disabled={loading} className="button primary">
            {loading ? 'Cargando...' : 'Crear Cuenta'}
          </button>
          <button
            type="button"
            onClick={() => setScreen('login')}
            className="button secondary"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </form>
      </div>
    </div>
  );

  // Pantalla de Home
  const HomeScreen = () => (
    <div className="container">
      <div className="header">
        <h1> Biblioteca BEC</h1>
        <div className="user-info">
          <span>¡Hola, {user?.name}!</span>
          <button onClick={handleLogout} className="button logout">Cerrar Sesión</button>
        </div>
      </div>
      <div className="menu-grid">
        <div className="menu-card" onClick={loadLibros}>
          <div className="menu-icon"></div>
          <h3>Catálogo</h3>
          <p>Explorar libros disponibles</p>
        </div>
        <div className="menu-card" onClick={loadReservas}>
          <div className="menu-icon"></div>
          <h3>Mis Reservas</h3>
          <p>Ver mis préstamos activos</p>
        </div>
      </div>
    </div>
  );

  // Pantalla de Catálogo
  const CatalogoScreen = () => (
    <div className="container">
      <div className="header">
        <button onClick={() => setScreen('home')} className="button back">← Volver</button>
        <h2> Catálogo de Libros</h2>
      </div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por título, autor o género..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input"
        />
      </div>
      <div className="libros-grid">
        {librosFiltrados.map(libro => (
          <div key={libro.id} className="libro-card">
            <img src={libro.imagen} alt={libro.titulo} className="libro-imagen" />
            <div className="libro-info">
              <h3>{libro.titulo}</h3>
              <p className="libro-autor">{libro.autor}</p>
              <p className="libro-genero">{libro.genero}</p>
              <span className={`libro-estado ${libro.disponibilidad === 'Disponible' ? 'disponible' : 'agotado'}`}>
                {libro.disponibilidad}
              </span>
              {libro.disponibilidad === 'Disponible' && (
                <button
                  onClick={() => crearReserva(libro.id, libro.titulo)}
                  disabled={loading}
                  className="button primary"
                >
                  Reservar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Pantalla de Reservas
  const ReservasScreen = () => (
    <div className="container">
      <div className="header">
        <button onClick={() => setScreen('home')} className="button back">← Volver</button>
        <h2> Mis Reservas</h2>
      </div>
      {reservas.length === 0 ? (
        <div className="empty-state">
          <p>No tienes reservas activas</p>
          <button onClick={loadLibros} className="button primary">
            Ir al Catálogo
          </button>
        </div>
      ) : (
        <div className="reservas-list">
          {reservas.map(reserva => (
            <div key={reserva._id} className="reserva-card">
              <div className="reserva-info">
                <h3>{reserva.libro?.titulo || 'Libro no encontrado'}</h3>
                <p> Desde: {new Date(reserva.desde).toLocaleDateString()}</p>
                <p> Hasta: {new Date(reserva.hasta).toLocaleDateString()}</p>
                <p className="reserva-tipo">Tipo: {reserva.tipo}</p>
              </div>
              <button
                onClick={() => cancelarReserva(reserva._id, reserva.libro?.titulo)}
                disabled={loading}
                className="button danger"
              >
                Cancelar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Renderizar pantalla actual
  return (
    <div className="app">
      {screen === 'login' && <LoginScreen />}
      {screen === 'register' && <RegisterScreen />}
      {screen === 'home' && <HomeScreen />}
      {screen === 'catalogo' && <CatalogoScreen />}
      {screen === 'reservas' && <ReservasScreen />}
    </div>
  );
}

export default App;