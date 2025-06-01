## INTRODUCCIÓN

Éste es el backend de la aplicación, desarrollado con NODE.JS, con el framework EXPRESS.JS, que se conecta a una SQL SERVER

El back-end sigue una arquitectura en capas o MVC, porque sigue el principio de división de responsabilidades, en donde "Routes" contiene las rutas para ejecutar los SPs y que serán llamadas en "Controllers", donde se encuentra principalmente la lógica de negocio. En segundo lugar, tenemos el la carpeta "config" en donde se ejecuta la conexión a la base de datos. El archivo principal es "server.js".

---

## 🚀 Tecnologías

- Node.js
- Express.js
- mssql (driver para SQL Server)
- Docker

---

## 📁 Estructura del proyecto

backend/
│
├── src/
│ ├── server.js # Punto de entrada de la aplicación
│ ├── config/
│ │ ├── db.js # Configuración y conexión a SQL Server
│ │ └── testConnection.js # Script para probar la conexión a la BD
│ ├── routes/
│ │ ├── authRoutes.js # Rutas relacionadas con autenticación
│ │ └── turnosRoutes.js # Rutas para la entidad "turnos"
│ └── controllers/
│   ├── authController.js # Lógica para autenticación
│   └── turnosController.js # Lógica para "turnos"
│
├── .env # Variables de entorno (BD, puerto, etc.)
├── package.json # Dependencias y scripts npm
├── Dockerfile # Dockerfile para construir la imagen
└── README.md # Este archivo

