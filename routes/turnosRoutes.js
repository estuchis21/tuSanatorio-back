const express = require('express');
const router = express.Router();
const turnosController = require('../controllers/turnosController');

router.post('/asignarTurno', turnosController.asignarTurno);
router.get('/misTurnos', (req, res) => {
  res.status(400).json({ error: "Falta id_paciente" });
});
router.get('/misTurnos/:id_paciente', turnosController.getTurnos);
router.get('/historialTurnosPaciente/:id_paciente', turnosController.historialTurnosPac);
router.get('/historialTurnosMedicos/:id_medico', turnosController.historialTurnosMed);
router.delete('/eliminarTurno', turnosController.deleteTurno);
router.get('/getTurnosDisponibles/:id_medico/:id_especialidad', turnosController.obtenerTurnosDisponibles);
router.get('/getObrasSociales', turnosController.obtenerObraSocial);
router.post('/insertTurnosDisp', turnosController.insertTurnosDisp);
router.get('/getRangos', turnosController.getRangos);


module.exports = router;
