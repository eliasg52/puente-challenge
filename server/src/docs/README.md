# Documentación API con Swagger

Este directorio contiene la documentación de la API utilizando Swagger/OpenAPI.

## Acceso a la Documentación

Una vez que el servidor esté en ejecución, puedes acceder a la documentación interactiva de la API en:

```
http://localhost:3000/api-docs
```

## Estructura de Archivos

- `swagger.json`: Contiene la definición completa de la API en formato OpenAPI 3.0.0
- `swagger.d.ts`: Archivo de declaración de tipos para permitir la importación del archivo JSON
- `README.md`: Esta guía

## Características de la Documentación

- Visualización interactiva de todos los endpoints de la API
- Posibilidad de ejecutar peticiones directamente desde la interfaz
- Información detallada sobre esquemas de datos, parámetros y respuestas
- Autenticación mediante token JWT para endpoints protegidos

## Cómo Mantener la Documentación

Para mantener la documentación actualizada, edita el archivo `swagger.json` cada vez que:

1. Se añada un nuevo endpoint a la API
2. Se modifiquen los parámetros de entrada o respuesta de un endpoint existente
3. Se añadan o modifiquen esquemas de datos
4. Se actualice cualquier detalle del funcionamiento de la API

## Uso con Swagger UI

La documentación se sirve utilizando [swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express), que proporciona una interfaz gráfica para explorar la API.

Para probar endpoints protegidos:

1. Inicia sesión utilizando el endpoint `/auth/login`
2. Copia el token JWT de la respuesta
3. Haz clic en el botón "Authorize" en la parte superior de la página
4. Introduce el token en el formato: `Bearer <token>`
5. Ahora puedes probar los endpoints protegidos

## Referencias

- [Especificación OpenAPI](https://spec.openapis.org/oas/v3.0.0)
- [Swagger UI Express](https://www.npmjs.com/package/swagger-ui-express)
