const { connectDB } = require('../config/db');
const sql = require('mssql');
const { enviarWhatsApp } = require('./enviarTurnoPorWhatsapp');

// Función para asignar turno
exports.asignarTurno = async (req, res) => {
  try {
    const { id_paciente, id_turno, id_obra_social } = req.body;

    if (!id_paciente || !id_turno || !id_obra_social) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
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

    // Asignar turno
    await pool.request()
      .input('id_turno', sql.Int, id_turno)
      .input('id_paciente', sql.Int, id_paciente)
      .input('id_obra_social', sql.Int, id_obra_social)
      .execute('AsignarTurno');

    // Obtener datos del paciente
    const paciente = await pool.request()
      .input('id_paciente', sql.Int, id_paciente)
      .execute('obtenerDatosUsuario');

    const tPaciente = paciente.recordset[0];
    if (!tPaciente) {
      return res.status(500).json({ error: 'No se pudieron obtener los datos del paciente' });
    }

    // Obtener datos del turno
    const datosTurno = await pool.request()
      .input('id_turno', sql.Int, id_turno)
      .execute('DatosDelTurno');

    const t = datosTurno.recordset[0];

    // Mensaje WhatsApp
    const mensaje = `✅ Turno confirmado!
    📌 Paciente: ${tPaciente.nombres} ${tPaciente.apellido}
    👨‍⚕️ Médico: ${t.medicoNombre} ${t.medicoApellido}
    🩺 Especialidad: ${t.especialidadNombre}
    📅 Fecha: ${t.fecha_turno}
    ⏰ Horario: ${t.hora_inicio} - ${t.hora_fin}
    Gracias por confiar en nuestro sanatorio.`;

    // Enviar WhatsApp
    enviarWhatsApp(tPaciente.telefono, mensaje)
      .catch(err => console.error('Error al enviar WhatsApp:', err));

    return res.status(200).json({ message: '✅ Turno asignado y WhatsApp enviado' });

  } catch (error) {
    console.error('❌ Error al asignar turno:', error);
    return res.status(500).json({ error: 'Error del servidor al asignar turno' });
  }
};


// Próximos turnos
exports.getTurnos = async (req, res) => {
  try {
    const { id_paciente } = req.params;

    // 1️⃣ Validación de parámetro
    if (!id_paciente || isNaN(Number(id_paciente))) {
      return res.status(400).json({ error: "Falta o es inválido el id_paciente" });
    }

    const pool = await connectDB();

    // 2️⃣ Verificamos si el paciente existe
    const pacienteResult = await pool.request()
      .input("id_paciente", sql.Int, Number(id_paciente))
      .execute("ExistePaciente");

    if (pacienteResult.recordset[0].count === 0) {
      return res.status(401).json({ error: "Paciente no encontrado" });
    }

    // 3️⃣ Obtenemos los próximos turnos
    const result = await pool.request()
      .input("id_paciente", sql.Int, Number(id_paciente))
      .execute("MisProximosTurnos");

    res.status(200).json({ turnos: result.recordset || [] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los turnos" });
  }
};


// Historial de turnos
exports.historialTurnosPac = async (req, res) => {
  try {
    const { id_paciente } = req.params;
    if (!id_paciente) return res.status(400).json({ error: "Falta id_paciente" });

    const pool = await connectDB();
    const result = await pool.request()
      .input("id_paciente", sql.Int, Number(id_paciente))
      .execute("MisTurnosHistoricos");

    // Siempre devolvemos array, aunque esté vacío
    res.json({ historial: result.recordset || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el historial de turnos" });
  }
};


exports.historialTurnosMed = async (req, res) => {
  const { id_medico } = req.params;

  const id = parseInt(id_medico, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID de médico inválido' });
  }

  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('id_medico', sql.Int, id)
      .execute('HistorialTurnosMedico');

    console.log("Datos de la SP:", result.recordset); // <--- verifica qué devuelve
    return res.status(200).json(result.recordset);

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
  const id_especialidad = parseInt(req.params.id_especialidad, 10);

  if (isNaN(id) || isNaN(id_especialidad)) {
    return res.status(400).json({ error: "El parámetro id_medico ni id_especialidad no son un número válido" });
  }

  if(!id){
    return res.status(404).json({error: 'No existe tal medico en la base de datos'});
  }

  if(!id_especialidad) return res.status(404).json({error: 'No existe tal especialidad en la base de datos'});

  try {
    const pool = await connectDB();
    const execute = await pool.request()
      .input('id_medico', sql.Int, id)
      .input('id_especialidad', sql.Int, id_especialidad)
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

exports.obtenerObraSocial = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .execute("GetObrasSociales");

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "No se encontró la obra social solicitada" });
    }

    return res.status(200).json(result.recordset);

  } catch (error) {
    console.error("Error al obtener la obra social:", error);
    return res.status(500).json({ error: "Hubo un error en el servidor al obtener la obra social" });
  }
};

exports.insertTurnosDisp = async (req, res) => {
  const { id_medico, id_rango, fecha_turno } = req.body;

  if (!id_medico || !id_rango || !fecha_turno) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const pool = await connectDB();

    const result = await pool.request()
    .input('id_medico', sql.Int, Number(id_medico))
    .input('id_rango', sql.Int, Number(id_rango))
    .input('fecha_turno', sql.Date, fecha_turno) // YYYY-MM-DD string está bien
    .execute('checkDobleTurno');

    console.log(result.recordset); // para depuración

    if (result.recordset.length > 0 && result.recordset[0].cantidad > 0) {
      return res.status(409).json({ error: 'Ya existe un turno disponible para ese horario y fecha' });
    }

    // 🔹 Insertamos
    await pool.request()
      .input('id_medico', sql.Int, id_medico)
      .input('id_rango', sql.Int, id_rango)
      .input('fecha_turno', sql.Date, fecha_turno)
      .execute('InsertTurnosDisponibles');

    res.status(201).json({ success: 'Turno disponible ingresado correctamente' });

  } catch (error) {
    console.error('Error en insertTurnosDisp:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};



exports.getRangos = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().execute('GetRangos');

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener los rangos' });
  }
};

exports.modificarTurno = async (req, res) => {
  try {
    const { id_turno_asignado, id_nuevo_turno, id_paciente, id_obra_social } = req.body;

    if (!id_turno_asignado || !id_nuevo_turno || !id_paciente || !id_obra_social) {
      return res.status(400).json({ error: 'Faltan datos para modificar el turno' });
    }

    const pool = await connectDB();

    // Ejecutar SP
    await pool.request()
      .input('id_turno_asignado', sql.Int, id_turno_asignado)
      .input('id_nuevo_turno', sql.Int, id_nuevo_turno)
      .input('id_paciente', sql.Int, id_paciente)
      .input('id_obra_social', sql.Int, id_obra_social)
      .execute('ModificarTurno');

    return res.status(200).json({ message: 'Turno modificado correctamente' });

  } catch (error) {
    console.error('❌ Error al modificar turno:', error);
    return res.status(500).json({ error: 'Error del servidor al modificar turno' });
  }
};

