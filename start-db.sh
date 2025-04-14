#!/bin/bash

echo "Iniciando la base de datos con Docker..."
docker compose up -d

echo "Esperando a que la base de datos esté lista..."
sleep 5

echo "Base de datos PostgreSQL lista en localhost:5432"
echo "Credenciales:"
echo "  Base de datos: financial_markets"
echo "  Usuario: postgres"
echo "  Contraseña: postgres"

echo "Ahora puedes iniciar el servidor con:"
echo "cd server && npm run dev" 