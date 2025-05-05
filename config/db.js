// db.js
require('dotenv').config();
const sql = require('mssql');

// Configuración de la base de datos
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  options: {
    encrypt: true, // Ajustar según tu configuración
    trustServerCertificate: true // Asegúrate de que este valor sea adecuado para tu entorno
  }
};

// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    console.log('Conectado a la base de datos!');
    return pool;
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1); // Termina el proceso en caso de error
  }
};

module.exports = connectDB;
