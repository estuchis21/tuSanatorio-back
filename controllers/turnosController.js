const connectDB = require('../config/db');
const sql = require('mssql');


exports.asignarTurno = async (req, res) => {
  try {
    const { id_paciente, id_turno, id_obra_social } = req.body;

    console.log('Datos recibidos:', { id_paciente, id_turno, id_obra_social });

    if (!id_paciente || !id_turno || !id_obra_social) {
      return res.status(409).json({ error: 'Faltan datos obligatorios' });
    }

    const pool = await connectDB();
    console.log('Conectado a la base de datos');

    // Verificar existencia del paciente
    const checkPaciente = await pool.request()
      .input('id_paciente', sql.Int, id_paciente)
      .query('SELECT 1 FROM pacientes WHERE id_paciente = @id_paciente');
    console.log('Check paciente:', checkPaciente.recordset);
    if (checkPaciente.recordset.length === 0) {
      return res.status(404).json({ error: 'No existe tal paciente' });
    }

    // Verificar existencia de la obra social
    const checkObra = await pool.request()
      .input('id_obra_social', sql.Int, id_obra_social)
      .query('SELECT 1 FROM Obras_sociales WHERE id_obra_social = @id_obra_social');
    console.log('Check obra social:', checkObra.recordset);
    if (checkObra.recordset.length === 0) {
      return res.status(404).json({ error: 'No existe tal obra social' });
    }

    // Verificar que el turno esté disponible (IMPORTANTE: aquí filtramos por id_turno)
    const checkTurnoDisp = await pool.request()
      .input('id_turno', sql.Int, id_turno)
      .query('SELECT 1 FROM Turnos_disponibles WHERE id_turno = @id_turno');
    console.log('Check turno disponible:', checkTurnoDisp.recordset);
    if (checkTurnoDisp.recordset.length === 0) {
      return res.status(400).json({ error: 'El turno no está disponible' });
    }

    // Asignar el turno (usamos el stored procedure)
    const result = await pool.request()
      .input('id_turno', sql.Int, id_turno)
      .input('id_paciente', sql.Int, id_paciente)
      .input('id_obra_social', sql.Int, id_obra_social)
      .execute('AsignarTurno');

    const turno = result.recordset;
    console.log('Turno asignado:', turno);

    if (!turno || turno.length === 0) {
      return res.status(400).json({ error: 'No se pudo asignar el turno' });
    }

    return res.status(200).json({
      message: 'Turno asignado correctamente',
      turno: turno[0]
    });

  } catch (error) {
    console.error('Error al asignar turno:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
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
  // Lógica para eliminar un turno
};
