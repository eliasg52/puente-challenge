# Financial Markets Tracking Application

A full-stack web application for tracking financial markets and managing investment portfolios.

## Features

- User authentication with JWT
- Financial market data monitoring
- Favoriting instruments
- Admin and user roles
- Responsive design

## Tech Stack

### Frontend

- React with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation

### Backend

- Node.js with Express
- TypeScript
- PostgreSQL for database
- JWT for authentication
- RESTful API design

### Infrastructure

- Docker for containerization of PostgreSQL
- Alpha Vantage API for financial data

## Getting Started

### Prerequisites

- Node.js v16+ and npm
- Docker and Docker Compose

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd puente-challenge
```

2. Start the PostgreSQL database:

```bash
docker-compose up -d
```

3. Install backend dependencies:

```bash
cd server
npm install
```

4. Set up environment variables:

```bash
# Create a .env file in the server directory using .env.example as a template
cp .env.example .env
# Edit the .env file with your configuration
```

5. Install frontend dependencies:

```bash
cd ../client
npm install
```

6. Start the development servers:

For the backend:

```bash
cd ../server
npm run dev
```

For the frontend:

```bash
cd ../client
npm run dev
```

7. Access the application:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Project Structure

```
puente-challenge/
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # State management (Zustand)
│   │   ├── types/           # TypeScript interfaces and types
│   │   └── utils/           # Utility functions
│   └── ...
├── server/                  # Backend Express application
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Express middlewares
│   │   ├── services/        # Business logic and external API integrations
│   │   └── utils/           # Utility functions
│   └── ...
└── docker-compose.yml       # Docker configuration
```

## API Documentation

API documentation is available at `/api-docs` when the server is running in development mode.

## License

This project is part of a technical challenge and is not licensed for public use.
