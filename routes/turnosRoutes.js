const express = require('express');
const router = express.Router();
const turnosController = require('../controllers/turnosController');

router.post('/asignarTurno', turnosController.asignarTurno);
router.get('/misTurnos', turnosController.getTurnos);
router.get('/historialTurnosPaciente', turnosController.historialTurnosPac);
router.get('/historialTurnosMedicos', turnosController.historialTurnosMed);
router.delete('/eliminarTurno', turnosController.deleteTurno);


module.exports = router;
