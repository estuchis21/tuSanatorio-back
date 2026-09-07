const { pool } = require('../config/db');

const {
  enviarWhatsApp
} = require('./enviarTurnoPorWhatsapp');


// =====================================================
// HELPER
// =====================================================

const ejecutarProcedure = async (
  client,
  nombreProcedure,
  parametros = []
) => {

  const cursor =
    `cur_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  const placeholders = parametros
    .map((_, index) => `$${index + 1}`)
    .join(', ');

  const sql = placeholders
    ? `CALL "${nombreProcedure}"(${placeholders}, '${cursor}')`
    : `CALL "${nombreProcedure}"('${cursor}')`;

  await client.query(sql, parametros);

  const result = await client.query(
    `FETCH ALL FROM "${cursor}"`
  );

  return result.rows;
};


// =====================================================
// ASIGNAR TURNO
// =====================================================

const asignarTurno = async (req, res) => {

  const {
    id_turno,
    id_paciente,
    id_obra_social
  } = req.body;

  if (
    id_turno === undefined ||
    id_paciente === undefined ||
    id_obra_social === undefined
  ) {
    return res.status(400).json({
      error:
        'id_turno, id_paciente e id_obra_social son obligatorios'
    });
  }

  const client = await pool.connect();

  try {

    // -----------------------------------------------
    // Verificar turno asignado
    // -----------------------------------------------

    await client.query('BEGIN');

    const turnoAsignadoCheck =
      await ejecutarProcedure(
        client,
        'TurnoAsignadoCheck',
        [
          id_turno,
          id_paciente
        ]
      );

    await client.query('COMMIT');

    if (turnoAsignadoCheck.length > 0) {
      return res.status(409).json({
        error:
          'El paciente ya tiene un turno asignado'
      });
    }


    // -----------------------------------------------
    // Verificar disponibilidad
    // -----------------------------------------------

    await client.query('BEGIN');

    const turnoDisponible =
      await ejecutarProcedure(
        client,
        'TurnoDisponibleCheck',
        [id_turno]
      );

    await client.query('COMMIT');

    if (!turnoDisponible.length) {
      return res.status(409).json({
        error:
          'El turno seleccionado ya no está disponible'
      });
    }


    // -----------------------------------------------
    // Asignar
    // -----------------------------------------------

    await client.query('BEGIN');

    const resultado =
      await ejecutarProcedure(
        client,
        'AsignarTurno',
        [
          id_turno,
          id_paciente,
          id_obra_social
        ]
      );

    await client.query('COMMIT');


    // -----------------------------------------------
    // Obtener datos del usuario
    // -----------------------------------------------

    let usuario = [];

    try {

      await client.query('BEGIN');

      usuario = await ejecutarProcedure(
        client,
        'obtenerDatosUsuario',
        [id_paciente]
      );

      await client.query('COMMIT');

    } catch (error) {

      await client.query('ROLLBACK');

      console.error(
        '⚠️ No se pudieron obtener datos del usuario:',
        error.message
      );
    }


    // -----------------------------------------------
    // Obtener datos del turno
    // -----------------------------------------------

    let datosTurno = [];

    try {

      await client.query('BEGIN');

      datosTurno = await ejecutarProcedure(
        client,
        'DatosDelTurno',
        [id_turno]
      );

      await client.query('COMMIT');

    } catch (error) {

      await client.query('ROLLBACK');

      console.error(
        '⚠️ No se pudieron obtener datos del turno:',
        error.message
      );
    }


    // -----------------------------------------------
    // WhatsApp
    // -----------------------------------------------

    try {

      if (
        usuario.length &&
        datosTurno.length
      ) {

        await enviarWhatsApp(
          usuario[0],
          datosTurno[0]
        );

      }

    } catch (error) {

      console.error(
        '⚠️ Error enviando WhatsApp:',
        error.message
      );

    }


    return res.status(201).json({
      message:
        'Turno asignado correctamente',
      data: resultado
    });

  } catch (error) {

    try {
      await client.query('ROLLBACK');
    } catch (_) {}

    console.error(
      '❌ Error asignando turno:',
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        'Error al asignar turno'
    });

  } finally {
    client.release();
  }
};


// =====================================================
// MIS TURNOS
// =====================================================

const getTurnos = async (req, res) => {

  const { id_paciente } = req.params;

  const client = await pool.connect();

  try {

    await client.query('BEGIN');

    const existePaciente =
      await ejecutarProcedure(
        client,
        'ExistePaciente',
        [id_paciente]
      );

    await client.query('COMMIT');

    if (!existePaciente.length) {
      return res.status(404).json({
        error: 'Paciente no encontrado'
      });
    }


    await client.query('BEGIN');

    const resultado =
      await ejecutarProcedure(
        client,
        'MisTurnosProximos',
        [id_paciente]
      );

    await client.query('COMMIT');

    return res.json(resultado);

  } catch (error) {

    try {
      await client.query('ROLLBACK');
    } catch (_) {}

    console.error(error);

    return res.status(500).json({
      error:
        'Error al obtener los turnos'
    });

  } finally {
    client.release();
  }
};


// =====================================================
// HISTORIAL PACIENTE
// =====================================================

const historialTurnosPac = async (req, res) => {

  const { id_paciente } = req.params;

  const client = await pool.connect();

  try {

    await client.query('BEGIN');

    const resultado =
      await ejecutarProcedure(
        client,
        'MisTurnosHistoricos',
        [id_paciente]
      );

    await client.query('COMMIT');

    return res.json(resultado);

  } catch (error) {

    try {
      await client.query('ROLLBACK');
    } catch (_) {}

    console.error(error);

    return res.status(500).json({
      error:
        'Error al obtener historial'
    });

  } finally {
    client.release();
  }
};


// =====================================================
// HISTORIAL MÉDICO
// =====================================================

const historialTurnosMed = async (req, res) => {

  const { id_medico } = req.params;

  const client = await pool.connect();

  try {

    await client.query('BEGIN');

    const resultado =
      await ejecutarProcedure(
        client,
        'HistorialTurnosMedico',
        [id_medico]
      );

    await client.query('COMMIT');

    return res.json(resultado);

  } catch (error) {

    try {
      await client.query('ROLLBACK');
    } catch (_) {}

    console.error(error);

    return res.status(500).json({
      error:
        'Error al obtener historial médico'
    });

  } finally {
    client.release();
  }
};


// =====================================================
// ELIMINAR / CANCELAR TURNO
// =====================================================

const deleteTurno = async (req, res) => {

  const {
    id_turno_asignado,
    id_paciente
  } = req.body;

  if (
    id_turno_asignado === undefined ||
    id_paciente === undefined
  ) {
    return res.status(400).json({
      error:
        'id_turno_asignado e id_paciente son obligatorios'
    });
  }

  const client = await pool.connect();

  try {

    // -----------------------------------------------
    // Verificar asignación
    // -----------------------------------------------

    await client.query('BEGIN');

    const check =
      await ejecutarProcedure(
        client,
        'CheckTurnoAsignado',
        [id_turno_asignado]
      );

    await client.query('COMMIT');

    if (!check.length) {
      return res.status(404).json({
        error:
          'El turno asignado no existe'
      });
    }


    // -----------------------------------------------
    // Verificar paciente
    // -----------------------------------------------

    await client.query('BEGIN');

    const pacienteTurno =
      await ejecutarProcedure(
        client,
        'IdPaciente_IdTurnoAsignado',
        [
          id_turno_asignado,
          id_paciente
        ]
      );

    await client.query('COMMIT');

    if (!pacienteTurno.length) {
      return res.status(403).json({
        error:
          'El turno no pertenece al paciente'
      });
    }


    // -----------------------------------------------
    // Cancelar
    // -----------------------------------------------

    await client.query('BEGIN');

    const resultado =
      await ejecutarProcedure(
        client,
        'CancelarTurno',
        [id_turno_asignado]
      );

    await client.query('COMMIT');

    return res.json({
      message:
        'Turno cancelado correctamente',
      data: resultado
    });

  } catch (error) {

    try {
      await client.query('ROLLBACK');
    } catch (_) {}

    console.error(error);

    return res.status(500).json({
      error:
        'Error al cancelar turno'
    });

  } finally {
    client.release();
  }
};


// =====================================================
// TURNOS DISPONIBLES
// =====================================================

const obtenerTurnosDisponibles = async (req, res) => {

  const {
    id_medico,
    id_especialidad
  } = req.params;

  const client = await pool.connect();

  try {

    await client.query('BEGIN');

    const resultado =
      await ejecutarProcedure(
        client,
        'GetTurnosDisponibles',
        [
          id_medico,
          id_especialidad
        ]
      );

    await client.query('COMMIT');

    return res.json(resultado);

  } catch (error) {

    try {
      await client.query('ROLLBACK');
    } catch (_) {}

    console.error(error);

    return res.status(500).json({
      error:
        'Error al obtener turnos disponibles'
    });

  } finally {
    client.release();
  }
};


// =====================================================
// OBRAS SOCIALES
// =====================================================

const obtenerObraSocial = async (req, res) => {

  const client = await pool.connect();

  try {

    await client.query('BEGIN');

    const resultado =
      await ejecutarProcedure(
        client,
        'getobrasociales'
      );

    await client.query('COMMIT');

    return res.json(resultado);

  } catch (error) {

    try {
      await client.query('ROLLBACK');
    } catch (_) {}

    console.error(
      '❌ Error obteniendo obras sociales:',
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        'Error al obtener obras sociales'
    });

  } finally {
    client.release();
  }
};


// =====================================================
// INSERTAR TURNOS DISPONIBLES
// =====================================================

const insertTurnosDisp = async (req, res) => {

  const {
    id_medico,
    id_rango,
    fecha_turno
  } = req.body;

  if (
    id_medico === undefined ||
    id_rango === undefined ||
    !fecha_turno
  ) {
    return res.status(400).json({
      error:
        'Médico, rango y fecha son obligatorios'
    });
  }

  const client = await pool.connect();

  try {

    // -----------------------------------------------
    // Verificar doble turno
    // -----------------------------------------------

    await client.query('BEGIN');

    const existe =
      await ejecutarProcedure(
        client,
        'checkDobleTurno',
        [
          id_medico,
          id_rango,
          fecha_turno
        ]
      );

    await client.query('COMMIT');

    if (existe.length) {
      return res.status(409).json({
        error:
          'Ya existe un turno para ese médico, rango y fecha'
      });
    }


    // -----------------------------------------------
    // Insertar
    // -----------------------------------------------

    await client.query('BEGIN');

    const resultado =
      await ejecutarProcedure(
        client,
        'InsertTurnosDisponibles',
        [
          id_medico,
          id_rango,
          fecha_turno
        ]
      );

    await client.query('COMMIT');

    return res.status(201).json({
      message:
        'Turno disponible creado correctamente',
      data: resultado
    });

  } catch (error) {

    try {
      await client.query('ROLLBACK');
    } catch (_) {}

    console.error(error);

    return res.status(500).json({
      error:
        'Error al crear turno disponible'
    });

  } finally {
    client.release();
  }
};


// =====================================================
// RANGOS
// =====================================================

const getRangos = async (req, res) => {

  const client = await pool.connect();

  try {

    await client.query('BEGIN');

    const resultado =
      await ejecutarProcedure(
        client,
        'GetRangos'
      );

    await client.query('COMMIT');

    return res.json(resultado);

  } catch (error) {

    try {
      await client.query('ROLLBACK');
    } catch (_) {}

    console.error(error);

    return res.status(500).json({
      error:
        'Error al obtener rangos'
    });

  } finally {
    client.release();
  }
};


// =====================================================
// MODIFICAR TURNO
// =====================================================

const modificarTurno = async (req, res) => {

  const {
    id_turno_asignado,
    id_turno,
    id_paciente,
    id_obra_social
  } = req.body;

  if (
    id_turno_asignado === undefined ||
    id_turno === undefined ||
    id_paciente === undefined ||
    id_obra_social === undefined
  ) {
    return res.status(400).json({
      error:
        'Faltan datos para modificar el turno'
    });
  }

  const client = await pool.connect();

  try {

    await client.query('BEGIN');

    const resultado =
      await ejecutarProcedure(
        client,
        'modificarTurno',
        [
          id_turno_asignado,
          id_turno,
          id_paciente,
          id_obra_social
        ]
      );

    await client.query('COMMIT');

    return res.json({
      message:
        'Turno modificado correctamente',
      data: resultado
    });

  } catch (error) {

    try {
      await client.query('ROLLBACK');
    } catch (_) {}

    console.error(
      '❌ Error modificando turno:',
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        'Error al modificar turno'
    });

  } finally {
    client.release();
  }
};


module.exports = {
  asignarTurno,
  getTurnos,
  historialTurnosPac,
  historialTurnosMed,
  deleteTurno,
  obtenerTurnosDisponibles,
  obtenerObraSocial,
  insertTurnosDisp,
  getRangos,
  modificarTurno
};