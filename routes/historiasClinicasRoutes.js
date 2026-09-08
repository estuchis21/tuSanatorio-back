const express = require('express');

const router =
  express.Router();

const historiasClinicasController =
  require('../controllers/histClinicasController');


// =====================================================
// CREAR HISTORIA
// =====================================================

router.post(
  '/crearHistoria',
  historiasClinicasController.insertarHistoriaPorDNI
);


// =====================================================
// HISTORIAS POR PACIENTE
// =====================================================

router.get(
  '/paciente/:id_paciente',
  historiasClinicasController.getHistoriasPorPaciente
);


// =====================================================
// HISTORIAS POR MÉDICO
// =====================================================

router.get(
  '/medico/:id_medico',
  historiasClinicasController.getHistoriasPorMedico
);


// =====================================================
// HISTORIAS POR DNI
// =====================================================

router.get(
  '/hisClinicas/:dni',
  historiasClinicasController.getHistoriasPorDni
);


module.exports = router;