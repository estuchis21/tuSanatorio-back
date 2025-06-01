const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const turnosRoutes = require('./routes/authRoutes');
app.use('/turnos', turnosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
