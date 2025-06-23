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
      .execute('TurnoAsignadoCheck');

    if (turnoAsignado.recordset.length > 0) {
      return res.status(409).json({ error: 'El turno ya está asignado' });
    }

    // Verificar si el turno está disponible
    const turnoDisponible = await pool.request()
      .input('id_turno', sql.Int, id_turno)
      .execute('TurnoDisponibleCheck');

    if (turnoDisponible.recordset.length === 0) {
      return res.status(409).json({ error: 'El turno no está disponible' });
    }

    // Ejecutar el stored procedure
    await pool.request()
      .input('id_turno', sql.Int, id_turno)
      .input('id_paciente', sql.Int, id_paciente)
      .input('id_obra_social', sql.Int, id_obra_social)
      .execute('AsignarTurno');

    return res.status(200).json({ message: 'Turno asignado correctamente' });

  } catch (error) {
    console.error('Error al asignar turno:', error);
    return res.status(500).json({ error: 'Error del servidor al asignar turno' });
  }
};


exports.getTurnos = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    if (!id_usuario) {
      return res.status(400).json({ error: 'Falta el id_usuario' });
    }

    const pool = await connectDB();

    const result = await pool.request()
      .input('id_usuario', sql.Int, id_usuario)
      .execute('MisTurnos');

    // result.recordset tendrá la lista de turnos con la columna 'Fecha de Asignación del Turno'
    res.json(result.recordset);

  } catch (error) {
    console.error('Error en getTurnos:', error);
    res.status(500).json({ error: 'Error al obtener los turnos' });
  }
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
      .execute('PacienteEnTurnosAsignados');

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
  const { id_medico } = req.params;

  // Validar que id_medico sea un número válido
  const id = parseInt(id_medico, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID de médico inválido' });
  }

  try {
    const pool = await connectDB();

    // Ejecutar el stored procedure
    const result = await pool.request()
      .input('id_medico', sql.Int, id)
      .execute('HistorialTurnosMedico');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'No hay turnos pasados para este médico' });
    }

    return res.status(200).json({ historial: result.recordset });

  } catch (error) {
    console.error('Error en historialTurnosMed:', error);
    return res.status(500).json({ error: 'Error al obtener el historial de turnos del médico' });
  }
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
      .execute('CheckTurnoAsignado');

    if (idTurnoCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'No existe ese turno asignado' });
    }

    // Verificar existencia del paciente con ese turno
    const idPacienteCheck = await pool.request()
      .input('id_paciente', sql.Int, id_paciente)
      .input('id_turno_asignado', sql.Int, id_turno_asignado)
      .execute('IdPaciente_IdTurnoAsignado');

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

exports.obtenerTurnosDisponibles = async (req, res) => {
  const id = parseInt(req.params.id_medico, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: "El parámetro id_medico no es un número válido" });
  }

  if(!id){
    return res.status(404).json({error: 'No existe tal medico en la base de datos'});
  }

  try {
    const pool = await connectDB();
    const execute = await pool.request()
      .input('id_medico', sql.Int, id)
      .execute('GetTurnosDisponibles');

    if (execute.recordset.length === 0) {
      return res.status(404).json({ error: 'El médico no tiene turnos disponibles' });
    }

    return res.status(200).json(execute.recordset);

  } catch (error) {
    console.error("Error al obtener turnos disponibles:", error);
    return res.status(500).json({ error: 'Hubo error para obtener los turnos disponibles' });
  }
}
