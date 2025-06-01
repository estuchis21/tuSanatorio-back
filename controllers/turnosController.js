const connectDB = require('../config/db');
const sql = require('mssql');

// controllers/turnosController.js

exports.asignarTurno = async (req, res) => {
  // Lógica para asignar un turno
};

exports.getTurnos = async (req, res) => {
  // Lógica para obtener los turnos del usuario actual
};

exports.historialTurnosPac = async (req, res) => {
  // Lógica para obtener el historial de turnos de un paciente
};

exports.historialTurnosMed = async (req, res) => {
  // Lógica para obtener el historial de turnos de un médico
};

exports.deleteTurno = async (req, res) => {
  // Lógica para eliminar un turno
};
