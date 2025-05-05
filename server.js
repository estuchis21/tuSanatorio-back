// server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Importamos la función de conexión

dotenv.config(); // Cargar las variables de entorno desde .env

const app = express();
const port = process.env.PORT || 3000;

// Configuración de Express
app.use(express.json()); // Para manejar JSON en las solicitudes

// Ruta de prueba para asegurar que el servidor está funcionando
app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
