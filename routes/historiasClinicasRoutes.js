const express = require('express');
const router = express.Router();
const historiasClinicasController = require('../controllers/histClinicasController');

router.post('/crearHistoria', historiasClinicasController.insertarHistoriaPorDNI);
router.get('/paciente/:id_paciente', historiasClinicasController.getHistoriasPorPaciente);
router.get('/medico/:id_medico', historiasClinicasController.getHistoriasPorMedico);
router.get('/hisClinicas/:dni', historiasClinicasController.getHistoriasPorDni);   


module.exports = router

