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

  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
};

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

pool.on('error', (err) => {
  console.error(
    '❌ Error inesperado en el pool de PostgreSQL:',
    err.message
  );
});

const connectDB = async () => {
  try {
    const client = await pool.connect();

    console.log('✅ Conectado a PostgreSQL');
    console.log('📊 Base de datos:', config.database);
    console.log('🖥️ Servidor:', config.host);
    console.log('🔌 Puerto:', config.port);

    client.release();

    return pool;
  } catch (err) {
    console.error(
      '❌ Error de conexión a PostgreSQL:',
      err.message
    );

    console.log('Configuración usada:', {
      host: config.host,
      database: config.database,
      port: config.port,
      user: config.user
    });

    process.exit(1);
  }
};

module.exports = {
  pool,
  connectDB
};