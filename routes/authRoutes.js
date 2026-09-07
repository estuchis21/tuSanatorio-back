const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');


// ===============================
// AUTENTICACIÓN
// ===============================

router.post(
  '/login',
  authController.loginUser
);

router.post(
  '/register',
  authController.registerUser
);


// ===============================
// ESPECIALIDADES
// ===============================

router.get(
  '/getEspecialidades',
  authController.getEspecialidades
);

router.get(
  '/getEspecialidadesPorMedico/:id_medico',
  authController.getEspecialidadesPorMedico
);

router.get(
  '/getMedicosPorEspecialidad/:id_especialidad',
  authController.getMedicosPorEspecialidad
);


// ===============================
// MÉDICOS
// ===============================

router.get(
  '/medico/usuario/:id_usuario',
  authController.getMedicoByUsuarioId
);

router.get(
  '/horarios/:id_medico',
  authController.getHorariosPorMedico
);

router.get(
  '/getObrasPorMedico/:id_medico',
  authController.getObrasPorMedico
);


// ===============================
// PACIENTES
// ===============================

router.get(
  '/paciente/usuario/:id_usuario',
  authController.getPacienteByUsuarioId
);

router.get(
  '/pacientes/buscar',
  authController.buscarPacientesPorTexto
);


// ===============================
// USUARIO
// ===============================

router.get(
  '/getUserById/:id_usuario',
  authController.getUsuarioById
);

router.put(
  '/perfil/:id_usuario',
  authController.actualizarPerfil
);

router.get(
  '/getObrasPorPaciente/:id_paciente',
  authController.getObrasPorPaciente
);


module.exports = router;