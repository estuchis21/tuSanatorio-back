const express = require('express');

const router = express.Router();

const historiasClinicasController =
  require('../controllers/histClinicasController');


// Crear historia clínica

router.post(
  '/crearHistoria',
  historiasClinicasController.insertarHistoriaPorDNI
);


// Historias por paciente

router.get(
  '/paciente/:id_paciente',
  historiasClinicasController.getHistoriasPorPaciente
);


// Historias por médico

router.get(
  '/medico/:id_medico',
  historiasClinicasController.getHistoriasPorMedico
);


// Historias por DNI

router.get(
  '/hisClinicas/:dni',
  historiasClinicasController.getHistoriasPorDni
);


module.exports = router;