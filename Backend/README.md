## 📌 Arquitectura General

La solución sigue un enfoque **event-driven y desacoplado**:

- **API Gateway (HTTP API)** expone los endpoints REST.
- **Lambda – API** gestiona las operaciones CRUD sobre incidencias.
- **DynamoDB** almacena las incidencias y permite consultas eficientes mediante GSIs.
- **DynamoDB Streams** detecta cambios en los datos.
- **Lambda – Notifier** procesa eventos del stream y decide si notificar.
- **SNS** envía alertas por correo electrónico cuando una incidencia es crítica.

---

## 🧱 Servicios AWS Utilizados

- Amazon API Gateway (HTTP API)
- AWS Lambda (2 funciones)
- Amazon DynamoDB (modo PROVISIONED)
- DynamoDB Streams
- Amazon SNS
- AWS IAM (rol existente `LabRole`)
- Terraform (Infrastructure as Code)

---

## 📂 Estructura del Proyecto

```text
Backend/
 ├── Terraform/
 │   ├── main.tf
 │   ├── variables.tf
 │   ├── outputs.tf
 │   ├── versions.tf
 └── Lambda/
     ├── lambda_api/
     │   └── index.mjs
     └── lambda_notifier/
         └── index.mjs
```

## 🗄️ Modelo de Datos (DynamoDB)

**Tabla:** `CIAS_Incidents`

### Clave primaria
- **Partition Key:** `incidentId` (String)
- **Sort Key:** `createdAt` (String – ISO 8601)

### Atributos principales
- `title` (String)
- `description` (String)
- `severity` (String: `low | medium | high`)
- `service` (String)
- `reportedBy` (String)
- `status` (String: `open | in_progress | closed`)
- `updatedAt` (String)

### Índices Secundarios Globales (GSI)

#### GSI_Severity_CreatedAt
- **Partition Key:** `severity`
- **Sort Key:** `createdAt`
- **Uso:** consultar incidencias por severidad ordenadas por fecha.

#### GSI_Service_CreatedAt
- **Partition Key:** `service`
- **Sort Key:** `createdAt`
- **Uso:** consultar incidencias por servicio afectado.

---

## 🔌 Endpoints Disponibles

### Health Check
```
GET /health
```

### Crear incidencia
```
POST /incidents
```

### Consultar incidencias
```
GET /incidents?severity=high
```

### Listar incidencias
```
GET /incidents/all?limit=20
```

### Actualizar estado
```
PATCH /incidents/{id}
```

---

## 🚨 Notificaciones (SNS)

- Se envían solo cuando:
  - `severity = high`
  - `status = open`
- Activadas mediante **DynamoDB Streams** y Lambda Notifier.

---

## ⚙️ Despliegue con Terraform

```
terraform init
terraform apply \
  -var="region=us-east-1" \
  -var="alert_email=correo@dominio.com" \
  -var="labrole_arn=arn:aws:iam::<ACCOUNT_ID>:role/LabRole"
```
Poner las variables de acuerdo a la cuenta de AWS

⚠️ Confirmar la suscripción SNS por email.

---
