require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true'
  }
};

// Validación simple
for (const key of ['DB_USER', 'DB_PASSWORD', 'DB_SERVER', 'DB_DATABASE']) {
  if (!process.env[key]) {
    console.warn(`⚠️  Variable de entorno ${key} no definida`);
  }
}

const connectDB = async () => {
  try {
    const pool = await sql.connect(config);
    console.log('✅ Conectado a la base de datos');
    return pool;
  } catch (err) {
    console.error('❌ Error de conexión a la base de datos:', err.message);
    console.log('Configuración usada:', {
      server: config.server,
      database: config.database,
      port: config.port
    });
    process.exit(1); // termina el contenedor si falla la conexión
  }
};

module.exports = { connectDB };
