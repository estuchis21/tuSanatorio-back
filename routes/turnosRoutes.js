const express = require('express');

const router = express.Router();

const turnosController =
  require('../controllers/turnosController');


// =====================================================
// TURNOS
// =====================================================

router.post(
  '/asignarTurno',
  turnosController.asignarTurno
);


// =====================================================
// MIS TURNOS
// =====================================================

router.get(
  '/misTurnos',
  (req, res) => {
    res.status(400).json({
      error: 'Falta id_paciente'
    });
  }
);

router.get(
  '/misTurnos/:id_paciente',
  turnosController.getTurnos
);


// =====================================================
// HISTORIA DE TURNOS
// =====================================================

router.get(
  '/historialTurnosPaciente/:id_paciente',
  turnosController.historialTurnosPac
);

router.get(
  '/historialTurnosMedicos/:id_medico',
  turnosController.historialTurnosMed
);


// =====================================================
// CANCELAR
// =====================================================

router.delete(
  '/eliminarTurno',
  turnosController.deleteTurno
);


// =====================================================
// DISPONIBLES
// =====================================================

router.get(
  '/getTurnosDisponibles/:id_medico/:id_especialidad',
  turnosController.obtenerTurnosDisponibles
);


// =====================================================
// OBRAS SOCIALES
// =====================================================

router.get(
  '/getObrasSociales',
  turnosController.obtenerObraSocial
);


// =====================================================
// CREAR DISPONIBLES
// =====================================================

router.post(
  '/insertTurnosDisp',
  turnosController.insertTurnosDisp
);


// =====================================================
// RANGOS
// =====================================================

router.get(
  '/getRangos',
  turnosController.getRangos
);


// =====================================================
// MODIFICAR
// =====================================================

router.put(
  '/modificarTurno',
  turnosController.modificarTurno
);


module.exports = router;