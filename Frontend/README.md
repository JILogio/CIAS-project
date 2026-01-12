## 🎯 Objetivo del Frontend

- Registrar incidencias técnicas
- Consultar incidencias existentes
- Actualizar el estado de una incidencia
- Consumir los endpoints REST del backend CIAS

---

## 🧱 Tecnologías Utilizadas

- React
- Vite
- JavaScript (ES6+)
- Fetch API
- Amazon S3 (Static Website Hosting)
- Amazon API Gateway
- CORS

---

## 📂 Estructura del Proyecto

```
Frontend/
 ├── src/
 │   ├── components/
 │   ├── pages/
 │   ├── services/
 │   │   └── api.js
 │   ├── App.jsx
 │   └── main.jsx
 ├── index.html
 ├── vite.config.js
 └── package.json
```

---

## 🔗 Comunicación con el Backend

La URL base de la API se define en un archivo de servicio:

```js
const API_BASE_URL = "https://<api-id>.execute-api.<region>.amazonaws.com";
export default API_BASE_URL;
```

---

## 🔌 Endpoints Consumidos

- `POST /incidents`
- `GET /incidents?severity=high`
- `GET /incidents?service=Web%20Server`
- `PATCH /incidents/{id}`
- `GET /health`

---

## 🌐 Configuración CORS

Configuración utilizada en API Gateway:

- Allowed Origins: URL del frontend en S3
- Allowed Methods: GET, POST, PATCH, OPTIONS
- Allowed Headers: Content-Type

---

## 🚀 Build y Despliegue en Amazon S3

### Instalar dependencias
```bash
npm install
```

### Build de producción
```bash
npm run build
```

El contenido generado en `dist/` se sube al bucket S3 con hosting estático habilitado.

---

## 🧪 Pruebas

- Verificar `/health`
- Crear incidencias
- Consultar incidencias
- Actualizar estado
- Confirmar notificaciones en backend

---
