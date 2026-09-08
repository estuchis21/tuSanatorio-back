require('dotenv').config();

const { Pool } = require('pg');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
    ? parseInt(process.env.DB_PORT, 10)
    : 5432,

  // Neon requiere SSL
  ssl: {
    rejectUnauthorized: false
  },

  // Pool de conexiones
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
};

// Verificar variables necesarias
const requiredVariables = [
  'DB_USER',
  'DB_PASSWORD',
  'DB_SERVER',
  'DB_DATABASE'
];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    console.warn(`⚠️ Variable de entorno ${variable} no definida`);
  }
}

const pool = new Pool(config);

// Error inesperado del pool
pool.on('error', (err) => {
  console.error(
    '❌ Error inesperado en el pool de PostgreSQL:',
    err.message
  );
});

// Probar conexión
const connectDB = async () => {
  let client;

  try {
    client = await pool.connect();

    console.log('====================================');
    console.log('✅ CONECTADO A POSTGRESQL');
    console.log('====================================');
    console.log('📊 Base de datos:', config.database);
    console.log('🖥️ Servidor:', config.host);
    console.log('🔌 Puerto:', config.port);
    console.log('👤 Usuario:', config.user);
    console.log('====================================');

    return pool;

  } catch (err) {

    console.error('====================================');
    console.error('❌ ERROR DE CONEXIÓN A POSTGRESQL');
    console.error('====================================');
    console.error(err.message);

    console.error('Configuración utilizada:', {
      host: config.host,
      database: config.database,
      port: config.port,
      user: config.user
    });

    throw err;

  } finally {

    if (client) {
      client.release();
    }
  }
};

module.exports = {
  pool,
  connectDB
};