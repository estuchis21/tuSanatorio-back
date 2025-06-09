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

    // Verificar si el turno ya fue asignado
    const turnoAsignado = await pool.request()
      .input('id_turno', sql.Int, id_turno)
      .query('SELECT * FROM Turnos_asignados WHERE id_turno = @id_turno');

    if (turnoAsignado.recordset.length > 0) {
      return res.status(409).json({ error: 'El turno ya está asignado' });
    }

    // Verificar si el turno está disponible
    const turnoDisponible = await pool.request()
      .input('id_turno', sql.Int, id_turno)
      .query('SELECT * FROM Turnos_disponibles WHERE id_turno = @id_turno');

    if (turnoDisponible.recordset.length === 0) {
      return res.status(409).json({ error: 'El turno no está disponible' });
    }

    // Ejecutar el stored procedure
    const turno = await pool.request()
      .input('id_turno', sql.Int, id_turno)
      .input('id_paciente', sql.Int, id_paciente)
      .input('id_obra_social', sql.Int, id_obra_social)
      .execute('AsignarTurno');

    return res.status(200).json({ message: 'Turno asignado correctamente'});

  } catch (error) {
    console.error('Error al asignar turno:', error);
    return res.status(500).json({ error: 'Error del servidor al asignar turno' });
  }
};


exports.getTurnos = async (req, res) => {
  // Lógica para obtener los turnos del usuario actual
};


exports.historialTurnosPac = async (req, res) => {
  const { id_paciente } = req.params;

  if (!id_paciente) {
    return res.status(400).json({ error: 'ID de paciente no proporcionado' });
  }

  try {
    const pool = await connectDB();

    // Verificar si el paciente tiene turnos asignados
    const checkResult = await pool.request()
      .input('id_paciente', sql.Int, id_paciente)
      .query('SELECT * FROM Turnos_asignados WHERE id_paciente = @id_paciente');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'No existe el paciente en la tabla de turnos asignados' });
    }

    // Llamar al stored procedure HistorialTurnos
    const result = await pool.request()
      .input('id_paciente', sql.Int, id_paciente)
      .execute('HistorialTurnos');

    return res.status(200).json({ historial: result.recordset });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener el historial de turnos del paciente' });
  }
};


exports.historialTurnosMed = async (req, res) => {
  // Lógica para obtener el historial de turnos de un médico
};

exports.deleteTurno = async (req, res) => {
  const { id_paciente, id_turno_asignado } = req.body;

  if (!id_paciente || !id_turno_asignado) {
    return res.status(409).json({ error: 'Faltan datos' });
  }

  try {
    const pool = await connectDB();

    // Verificar existencia del turno asignado
    const idTurnoCheck = await pool.request()
      .input('id_turno_asignado', sql.Int, id_turno_asignado)
      .query('SELECT * FROM Turnos_asignados WHERE id_turno_asignado = @id_turno_asignado');

    if (idTurnoCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'No existe ese turno asignado' });
    }

    // Verificar existencia del paciente con ese turno
    const idPacienteCheck = await pool.request()
      .input('id_paciente', sql.Int, id_paciente)
      .input('id_turno_asignado', sql.Int, id_turno_asignado)
      .query('SELECT * FROM Turnos_asignados WHERE id_paciente = @id_paciente AND id_turno_asignado = @id_turno_asignado');

    if (idPacienteCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'El turno no está asignado a ese paciente' });
    }

    // Ejecutar SP
    await pool.request()
      .input('id_paciente', sql.Int, id_paciente)
      .input('id_turno_asignado', sql.Int, id_turno_asignado)
      .execute('CancelarTurno');

    res.status(200).json({ message: 'Turno cancelado exitosamente' });

  } catch (err) {
    console.error('Error al ejecutar el SP:', err);
    res.status(500).json({ error: 'Error al cancelar el turno.' });
  }
};
