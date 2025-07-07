const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.loginUser);
router.post('/register', authController.registerUser);
router.get('/getEspecialidades', authController.getEspecialidades)
router.get('/paciente/usuario/:id_usuario', authController.getPacienteByUsuarioId);
router.get('/medico/usuario/:id_usuario', authController.getMedicoByUsuarioId);

module.exports = router;