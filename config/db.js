const sql = require('mssql');

const config = {
  user: 'estuchis',
  password: 'F.1.atyUmika',
  server: 'DESKTOP-924QJJU',
  database: 'tuSanatorio',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const connectDB = async () => {
  try {
    const pool = await sql.connect(config);
    console.log('Conectado a la base de datos');
    return pool;
  } catch (err) {
    console.error('Error de conexión a la base de datos:', err);
    throw err;
  }
};

module.exports = connectDB;
