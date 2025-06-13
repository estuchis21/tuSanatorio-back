const express = require('express');
const router = express.Router();
const turnosController = require('../controllers/turnosController');

router.post('/asignarTurno', turnosController.asignarTurno);
router.get('/misTurnos/:id_usuario', turnosController.getTurnos);
router.get('/historialTurnosPaciente/:id_paciente', turnosController.historialTurnosPac);
router.get('/historialTurnosMedicos/:id_medico', turnosController.historialTurnosMed);
router.delete('/eliminarTurno', turnosController.deleteTurno);


module.exports = router;
