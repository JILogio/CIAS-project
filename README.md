# Cloud Incident Alert System (CIAS)

Sistema backend **serverless** para la gestión de incidencias técnicas en la nube, desarrollado sobre **AWS** usando **API Gateway, Lambda, DynamoDB, SNS y Terraform**.
El sistema permite **crear, consultar y actualizar incidencias**, y **notificar automáticamente** incidencias críticas mediante correo electrónico.

---

## Objetivos del Proyecto

### Objetivo General
Diseñar e implementar una aplicación distribuida en la nube que demuestre el uso integrado de servicios AWS para la gestión de incidencias técnicas, aplicando buenas prácticas de escalabilidad, automatización y desacoplamiento.

### Objetivos Específicos
- Implementar un backend serverless basado en AWS Lambda y API Gateway.
- Utilizar Amazon DynamoDB como sistema de persistencia NoSQL optimizado para consultas.
- Incorporar un mecanismo de notificaciones automáticas mediante Amazon SNS.
- Desplegar un frontend web ligero utilizando React y Vite, alojado en Amazon S3.
- Automatizar el despliegue de la infraestructura utilizando Terraform.
- Garantizar la comunicación segura entre frontend y backend mediante políticas CORS.

---

## Visión General de la Arquitectura

La arquitectura del sistema CIAS se basa en un enfoque **event-driven**, separando claramente las responsabilidades de cada componente:

- El **Frontend** proporciona la interfaz de usuario y se despliega como sitio estático en Amazon S3.
- El **Backend API** expone endpoints REST a través de API Gateway y procesa las solicitudes mediante una función Lambda.
- **DynamoDB** actúa como base de datos principal para el almacenamiento de incidencias.
- **DynamoDB Streams** detecta cambios en los datos y dispara eventos automáticamente.
- Una segunda función **Lambda Notifier** procesa estos eventos y decide si se debe generar una alerta.
- **Amazon SNS** se encarga del envío de notificaciones por correo electrónico.
- **Terraform** gestiona toda la infraestructura como código, facilitando el despliegue en distintas cuentas AWS.

---

## Características Principales

- Arquitectura completamente serverless
- Desacoplamiento entre lógica de negocio y notificaciones
- Escalabilidad automática
- Bajo costo operativo
- Despliegue reproducible
- Enfoque académico y práctico

---

## Alcance del Proyecto

El alcance del proyecto se centra en el **backend funcional y el frontend demostrativo**, permitiendo validar el flujo completo de una incidencia desde su creación hasta la notificación automática. No se incluyen mecanismos avanzados de autenticación ni interfaces gráficas complejas, ya que el foco principal es el **diseño arquitectónico y la integración de servicios en la nube**.

---

## Arquitectura

![Diagrama](https://ucf8b7f728d2fd037149247fc45e.previews.dropboxusercontent.com/p/thumb/AC50F7zBgLuKC_km5Ezi-f_l-Ze-6O0gzNYas2fVpWho_L39O60EeZh98hy6em0tG_wKDgjV85zXzlaiCUzlk0sI8wghbDGoAaI6Eah1F0wFgFmM5X7WxoHCA7UMq7aMQpPRRKuofhbsTshkjmWSmSPsjIFbxNTQ_CGPdc68cLkUR34GJj8Nx_sk_lpuFkFSooLeJYbAC4oUnVx5hytiVywIN5-wo378ZSwd_ego8v_1Owv1zNNUhUx7ZAtjVMPYBr1EajMU_JIP1vrfSMjC5zimd1sqlRCqaiwkPxZsqCliRB1u5fkN9Aw_ih0GjdN8JgXPuqNTGyqPG9crO1hkdXyByM8XCNOfK149eBTbOuRD7fZh1CdvnazI-549Wx7E99w/p.png?is_prewarmed=true)

---

## Conclusión

El **Cloud Incident Alert System (CIAS)** demuestra cómo es posible construir una solución moderna, escalable y eficiente utilizando servicios gestionados de AWS. El proyecto integra múltiples tecnologías cloud de forma coherente, sirviendo como un caso de estudio práctico para el desarrollo de aplicaciones distribuidas en la nube.

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Ver el archivo `LICENSE` para más información.
