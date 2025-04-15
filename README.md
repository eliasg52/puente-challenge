# Puente Challenge 📈

Una aplicación web full-stack para seguimiento de mercados financieros y gestión de carteras de inversión.

## Características

- Autenticación de usuarios con JWT
- Monitoreo de datos de mercados financieros
- Marcado de instrumentos como favoritos
- Roles de administrador y usuario
- Diseño responsive
- Actualización automática de datos cada 5 minutos

## Stack Tecnológico

### Frontend

- React con TypeScript
- Tailwind CSS para estilos
- Zustand para gestión de estado
- React Router para navegación

### Backend

- Node.js con Express
- TypeScript
- PostgreSQL para base de datos
- JWT para autenticación
- Diseño API RESTful
- Swagger para documentación de API

### Infraestructura

- Docker para contenedorización de PostgreSQL
- API CoinGecko para datos financieros

## Comenzando

### Prerrequisitos

- Node.js v16+ y npm
- Docker y Docker Compose

### Instalación

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd puente-challenge
```

2. Inicia la base de datos PostgreSQL:

```bash
docker-compose up -d
```

3. Instala las dependencias del backend:

```bash
cd server
npm install
```

4. Configura las variables de entorno:

```bash
# Crea un archivo .env en el directorio server
```

El archivo .env debe contener lo siguiente:

```
PORT=3000
NODE_ENV=development
USE_DB=true

# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=financial_markets
DB_USER=postgres
DB_PASSWORD=postgres

# Configuración JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d
```

5. Instala las dependencias del frontend:

```bash
cd ../client
npm install
```

6. Inicia los servidores de desarrollo:

Para el backend:

```bash
cd ../server
npm run dev
```

Para el frontend:

```bash
cd ../client
npm run dev
```

7. Accede a la aplicación:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Credenciales de Usuario Administrador

La aplicación crea automáticamente un usuario administrador cuando se inicia por primera vez:

- **Email**: `admin@example.com`
- **Contraseña**: `admin123`

Puedes usar estas credenciales para acceder a todas las funcionalidades de la aplicación, incluyendo las exclusivas para administradores como es ver los usuarios o borrarlos.

El frontend utiliza las variables de entorno proporcionadas por Vite en tiempo de compilación. No es necesario crear un archivo .env en el cliente para desarrollo local.

## Documentación de la API con Swagger

La documentación interactiva de la API está disponible en la ruta `/api-docs` cuando el servidor está en ejecución:

1. Inicia el servidor:

```bash
cd server
npm run dev
```

2. Abre la documentación en tu navegador:

```
http://localhost:3000/api-docs
```

3. En la interfaz de Swagger puedes:
   - Ver todos los endpoints disponibles
   - Probar los endpoints directamente desde la interfaz
   - Ver los esquemas de datos y modelos
   - Autenticarte para probar endpoints protegidos

Para autenticarte en Swagger:

1. Usa el endpoint `/auth/login` para obtener un token
2. Haz clic en el botón "Authorize" en la parte superior de la página
3. Ingresa tu token en el formato: `Bearer <tu-token>`
4. Ahora puedes probar los endpoints protegidos

## Estructura del Proyecto

```
puente-challenge/
├── client/                  # Aplicación frontend con React
│   ├── src/
│   │   ├── components/      # Componentes UI reutilizables
│   │   ├── pages/           # Componentes de página
│   │   ├── services/        # Funciones de servicio API
│   │   ├── hooks/           # Hooks personalizados de React
│   │   ├── store/           # Gestión de estado (Zustand)
│   │   ├── types/           # Interfaces y tipos de TypeScript
│   │   └── utils/           # Funciones de utilidad
│   └── ...
├── server/                  # Aplicación backend con Express
│   ├── src/
│   │   ├── controllers/     # Controladores API
│   │   ├── models/          # Modelos de base de datos
│   │   ├── routes/          # Rutas API
│   │   ├── middlewares/     # Middlewares de Express
│   │   ├── services/        # Lógica de negocio e integraciones API externas
│   │   ├── docs/            # Documentación Swagger
│   │   └── utils/           # Funciones de utilidad
│   └── ...
└── docker-compose.yml       # Configuración de Docker
```

## Licencia

Este proyecto es parte de un desafío técnico y no está licenciado para uso público.
