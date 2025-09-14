// C:\Users\Esteban\Desktop\tuSanatorio\tuSanatorio-back\config\db.js

require('dotenv').config(); // Carga variables desde el .env
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // true o false según el .env
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true' // true o false según el .env
  }
};

const connectDB = async () => {
  try {
    const pool = await sql.connect(config);
    console.log('✅ Conectado a la base de datos');
    return pool;
  } catch (err) {
    console.error('❌ Error de conexión a la base de datos:', err);
    throw err;
  }
};

module.exports = connectDB;
