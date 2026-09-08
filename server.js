require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { connectDB } = require('./config/db');

const authRoutes =
  require('./routes/authRoutes');

const turnosRoutes =
  require('./routes/turnosRoutes');

const histClinicasRoutes =
  require('./routes/historiasClinicasRoutes');


const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: 'https://tu-sanatorio-front.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  })
);

app.options('*', cors());

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true
  })
);


// =====================================================
// RUTAS
// =====================================================

app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/turnos',
  turnosRoutes
);

app.use(
  '/api/historias',
  histClinicasRoutes
);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
  '/',
  (req, res) => {
    res.json({
      message:
        'API tuSanatorio funcionando',
      database:
        'PostgreSQL'
    });
  }
);


// =====================================================
// ERROR 404
// =====================================================

app.use(
  (req, res) => {
    res.status(404).json({
      error: 'Ruta no encontrada'
    });
  }
);


// =====================================================
// START
// =====================================================

const PORT =
  process.env.PORT || 3000;

const iniciarServidor = async () => {

  await connectDB();

  app.listen(
    PORT,
    '0.0.0.0',
    () => {

      console.log(
        `🚀 Servidor ejecutándose en puerto ${PORT}`
      );

      console.log(
        `📡 http://localhost:${PORT}`
      );

    }
  );
};


iniciarServidor();