const express = require('express');
const router = express.Router();
const historiasClinicasController = require('../controllers/histClinicasController');

router.post('/crearHistoria', historiasClinicasController.insertarHistoria);
router.get('/paciente/:id_paciente', historiasClinicasController.getHistoriasPorPaciente);
router.get('/medico/:id_medico', historiasClinicasController.getHistoriasPorMedico);

module.exports = router
