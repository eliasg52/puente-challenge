# Configuración de Base de Datos con Docker

Este proyecto utiliza PostgreSQL en Docker para almacenar datos. Sigue estas instrucciones para configurar y ejecutar la base de datos.

## Requisitos Previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado en tu sistema

## Pasos para Configurar la Base de Datos

1. **Instalar Docker Desktop**

   - Descarga e instala Docker Desktop desde [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
   - Inicia Docker Desktop después de la instalación

2. **Iniciar la Base de Datos**

   - Ejecuta el script de inicio:
     ```
     ./start-db.sh
     ```
   - O manualmente con:
     ```
     docker compose up -d
     ```

3. **Verificar que la Base de Datos esté Funcionando**

   - Puedes ver los contenedores en ejecución con:
     ```
     docker ps
     ```
   - Deberías ver un contenedor llamado `puente-postgres` en ejecución

4. **Conectar el Servidor a la Base de Datos**

   - El archivo `.env` del servidor ya está configurado para conectarse a la base de datos.
   - Asegúrate de que el parámetro `USE_DB=true` esté configurado en el archivo `.env`.

5. **Iniciar el Servidor**
   - Navega al directorio del servidor e inicia la aplicación:
     ```
     cd server && npm run dev
     ```

## Credenciales de la Base de Datos

- **Host**: localhost
- **Puerto**: 5432
- **Base de Datos**: financial_markets
- **Usuario**: postgres
- **Contraseña**: postgres

## Administración de la Base de Datos

Para administrar la base de datos, puedes usar herramientas como:

- [pgAdmin](https://www.pgadmin.org/download/)
- [DBeaver](https://dbeaver.io/download/)
- O el cliente SQL incluido en Docker:
  ```
  docker exec -it puente-postgres psql -U postgres -d financial_markets
  ```

## Detener la Base de Datos

Para detener el contenedor de la base de datos:

```
docker compose down
```

## Datos Persistentes

Los datos se almacenan en un volumen de Docker llamado `postgres_data`. Esto significa que tus datos persistirán incluso si detienes el contenedor.

Si necesitas borrar todos los datos y empezar desde cero:

```
docker compose down -v
```
