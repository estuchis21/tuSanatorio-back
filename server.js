require('dotenv').config();

const express = require('express');
const cors = require('cors');

const {
  connectDB
} = require('./config/db');

const authRoutes =
  require('./routes/authRoutes');

const turnosRoutes =
  require('./routes/turnosRoutes');

const histClinicasRoutes =
  require('./routes/historiasClinicasRoutes');


const app =
  express();


// =====================================================
// CORS
// =====================================================

const allowedOrigins = [

  'https://tu-sanatorio-front.vercel.app',

  'http://localhost:3000',

  'http://localhost:5173'

];


app.use(
  cors({

    origin: function (
      origin,
      callback
    ) {

      // Permitir requests sin origin
      // (Postman, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin)
      ) {

        return callback(
          null,
          true
        );

      }

      return callback(
        new Error(
          'Origen no permitido por CORS'
        )
      );

    },

    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'OPTIONS'
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ],

    credentials: true

  })
);


// =====================================================
// MIDDLEWARE
// =====================================================

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

    res.status(200).json({

      message:
        'API tuSanatorio funcionando',

      database:
        'PostgreSQL',

      environment:
        process.env.NODE_ENV || 'development'

    });

  }
);


// =====================================================
// 404
// =====================================================

app.use(
  (req, res) => {

    res.status(404).json({
      error:
        'Ruta no encontrada'
    });

  }
);


// =====================================================
// ERROR GLOBAL
// =====================================================

app.use(
  (error, req, res, next) => {

    console.error(
      '❌ Error global:',
      error
    );

    return res.status(500).json({

      error:
        'Error interno del servidor'

    });

  }
);


// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 3000;


const iniciarServidor =
  async () => {

    try {

      await connectDB();

      app.listen(
        PORT,
        '0.0.0.0',
        () => {

          console.log(
            `🚀 Servidor ejecutándose en puerto ${PORT}`
          );

          console.log(
            `📡 Puerto: ${PORT}`
          );

        }
      );

    } catch (error) {

      console.error(
        '❌ No se pudo iniciar el servidor:',
        error
      );

      process.exit(1);

    }

  };


iniciarServidor();