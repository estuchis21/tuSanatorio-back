const connectDB = require('./db');

(async () => {
  try {
    await connectDB();
    console.log('Conexión exitosa');
  } catch (err) {
    console.error('Error al conectar:', err);
  }
})();
