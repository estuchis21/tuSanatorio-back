const express = require('express');
const app = express();
const cors = require('cors');
const { connectDB } = require('./config/db');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
const turnosRoutes = require('./routes/turnosRoutes');
const authRoutes = require('./routes/authRoutes');
app.use('/turnos', turnosRoutes);
app.use('/auth', authRoutes);

// Test simple
app.get('/', (req, res) => {
  res.send('Servidor activo');
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
});
