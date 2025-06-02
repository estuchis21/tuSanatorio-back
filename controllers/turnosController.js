const connectDB = require('../config/db');
const sql = require('mssql');


exports.asignarTurno = async (req, res) => {
  try {
    const { id_paciente, id_turno, id_obra_social } = req.body;

    // Validar campos obligatorios
    if (
      id_paciente === undefined ||
      id_turno === undefined ||
      id_obra_social === undefined
    ) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Validar tipos
    if (
      typeof id_paciente !== 'number' ||
      typeof id_turno !== 'number' ||
      typeof id_obra_social !== 'number'
    ) {
      return res.status(400).json({ error: 'Los campos deben ser números' });
    }

    const pool = await connectDB();

    // Verificar si paciente existe
    const pacienteCheck = await pool.request()
      .input('id_paciente', sql.Int, id_paciente)
      .query('SELECT 1 FROM pacientes WHERE id_paciente = @id_paciente');

    if (pacienteCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    // Verificar si obra social existe
    const obraCheck = await pool.request()
      .input('id_obra_social', sql.Int, id_obra_social)
      .query('SELECT 1 FROM Obras_sociales WHERE id_obra_social = @id_obra_social');

    if (obraCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Obra social no encontrada' });
    }

    // Verificar si el turno está disponible
    const turnoCheck = await pool.request()
      .input('id_turno', sql.Int, id_turno)
      .query('SELECT 1 FROM Turnos_disponibles WHERE id_turno = @id_turno');

    if (turnoCheck.recordset.length === 0) {
      return res.status(400).json({ error: 'Turno no disponible o ya asignado' });
    }

    // Ejecutar stored procedure para asignar turno
    await pool.request()
      .input('id_turno', sql.Int, id_turno)
      .input('id_paciente', sql.Int, id_paciente)
      .input('id_obra_social', sql.Int, id_obra_social)
      .execute('AsignarTurno');

    return res.status(200).json({ message: 'Turno asignado correctamente' });

  } catch (error) {
    return res.status(500).json({ error: 'Error interno al asignar turno' });
  }
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
  const { id_paciente, id_turno } = req.body;

  try {
    const pool = await connectDB();

    const request = await pool.request();
    request.input('id_paciente', sql.Int, id_paciente);
    request.input('id_turno', sql.Int, id_turno);
    request.execute('CancelarTurno');

    res.status(200).send('Se ejecutó el procedimiento almacenado CancelarTurno.');

  } catch (err) {
    console.error('Error al ejecutar el SP:', err);
    res.status(500).send('Error al cancelar el turno.');
  }
};
