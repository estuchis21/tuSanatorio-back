const { pool } = require('../config/db');


// =====================================================
// HELPER
// =====================================================

const ejecutarProcedure = async (
  client,
  nombreProcedure,
  parametros = []
) => {
  const cursor = `cur_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

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
// INSERTAR HISTORIA POR DNI
// =====================================================

const insertarHistoriaPorDNI = async (req, res) => {
  const {
    dni,
    id_medico,
    historia_clinica
  } = req.body;

  if (
    dni === undefined ||
    id_medico === undefined ||
    !historia_clinica
  ) {
    return res.status(400).json({
      error:
        'DNI, médico e historia clínica son obligatorios'
    });
  }

  const client = await pool.connect();

  try {

    // -----------------------------------------------
    // Buscar paciente
    // -----------------------------------------------

    await client.query('BEGIN');

    const pacientes = await ejecutarProcedure(
      client,
      'sp_GetPacienteByDNI',
      [dni]
    );

    await client.query('COMMIT');

    if (!pacientes.length) {
      return res.status(404).json({
        error: 'No existe un paciente con ese DNI'
      });
    }

    const paciente = pacientes[0];

    const id_paciente =
      paciente.id_paciente;

    // -----------------------------------------------
    // Crear historia clínica
    // -----------------------------------------------

    await client.query('BEGIN');

    const resultado = await ejecutarProcedure(
      client,
      'insertarHistoriaConDetalle',
      [
        id_paciente,
        id_medico,
        historia_clinica
      ]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      message:
        'Historia clínica registrada correctamente',
      data: resultado
    });

  } catch (error) {

    try {
      await client.query('ROLLBACK');
    } catch (_) {}

    console.error(
      '❌ Error al insertar historia:',
      error
    );

    return res.status(500).json({
      error: 'Error al insertar historia clínica'
    });

  } finally {
    client.release();
  }
};


// =====================================================
// HISTORIAS POR DNI
// =====================================================

const getHistoriasPorDni = async (req, res) => {
  const { dni } = req.params;

  const client = await pool.connect();

  try {

    await client.query('BEGIN');

    const resultado = await ejecutarProcedure(
      client,
      'getHistoriasPorDniPaciente',
      [dni]
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
        'Error al obtener historias clínicas'
    });

  } finally {
    client.release();
  }
};


// =====================================================
// HISTORIAS POR PACIENTE
// =====================================================

const getHistoriasPorPaciente = async (req, res) => {
  const { id_paciente } = req.params;

  const client = await pool.connect();

  try {

    await client.query('BEGIN');

    const resultado = await ejecutarProcedure(
      client,
      'getHistoriasPorPaciente',
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
        'Error al obtener historias del paciente'
    });

  } finally {
    client.release();
  }
};


// =====================================================
// HISTORIAS POR MÉDICO
// =====================================================

const getHistoriasPorMedico = async (req, res) => {
  const { id_medico } = req.params;

  const client = await pool.connect();

  try {

    await client.query('BEGIN');

    const resultado = await ejecutarProcedure(
      client,
      'getHistoriasPorMedico',
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
        'Error al obtener historias del médico'
    });

  } finally {
    client.release();
  }
};


module.exports = {
  insertarHistoriaPorDNI,
  getHistoriasPorDni,
  getHistoriasPorPaciente,
  getHistoriasPorMedico
};