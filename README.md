# Frontend Horarios

## Requisitos
- Node.js 18+
- npm

## Variables de entorno
Crea un archivo `.env` en la raíz con:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Scripts disponibles
- `npm run dev`: entorno de desarrollo.
- `npm run build`: compilación para producción.
- `npm run preview`: vista previa de la compilación.

## Apuntar al backend
1. Asegúrate de que el backend esté en ejecución.
2. Establece `VITE_API_BASE_URL` con la URL del backend.
3. Ejecuta `npm run dev` para levantar la aplicación.

## Flujo de demostración
1. Inicia sesión con un usuario válido.
2. Realiza operaciones CRUD básicas sobre los recursos disponibles.
3. Crea una clase asegurando que los horarios no se empalmen.

## Dashboard administrativo
- La ruta protegida `/dashboard` muestra un resumen para administradores con indicadores clave (usuarios, docentes, reservas y ocupación).
- El tablero incorpora tarjetas responsivas y visualizaciones interactivas (distribución de usuarios, horarios más solicitados y tendencia de reservas) construidas sobre `react-apexcharts`.
- Los datos se obtienen desde `src/services/dashboardApi.ts`, que consume los endpoints REST:
  - `GET /dashboard/stats`
  - `GET /dashboard/user-distribution`
  - `GET /dashboard/popular-times`
  - `GET /dashboard/trends`
- El botón **Actualizar datos** permite refrescar la información bajo demanda.

## Pruebas
- Ejecuta `npm run test` para correr la batería de pruebas unitarias (incluye servicios y componentes del dashboard).

## Notas
- Accesibilidad: se anima a verificar contraste, navegación por teclado y uso de etiquetas semánticas.
- Pruebas: el proyecto cuenta con pruebas unitarias utilizando Vitest.
- Semilla de datos: depende del backend; consulta su documentación si requiere datos iniciales.
