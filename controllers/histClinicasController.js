const sql = require('mssql');
const {connectDB} = require('../config/db');

// Insertar historia clínica con detalle usando DNI
exports.insertarHistoriaPorDNI = async (req, res) => {
  const { dni, id_medico, historia_clinica } = req.body;

  if (!dni || !id_medico || !historia_clinica) {
    return res.status(400).json({
      success: false,
      mensaje: "Faltan parámetros requeridos: dni, id_medico o historia_clinica"
    });
  }

  try {
    const pool = await connectDB();

    // 1️⃣ Obtener id_paciente desde el DNI
    const pacienteResult = await pool.request()
      .input('dni', sql.NVarChar(50), dni)
      .execute('sp_GetPacienteByDNI');

    const paciente = pacienteResult.recordset[0];
    if (!paciente) {
      return res.status(404).json({
        success: false,
        mensaje: `No se encontró paciente con DNI ${dni}`
      });
    }

    // 2️⃣ Insertar historia clínica
    const historiaResult = await pool.request()
      .input('id_paciente', sql.Int, paciente.id_paciente)
      .input('id_medico', sql.Int, id_medico)
      .input('historia_clinica', sql.NVarChar(sql.MAX), historia_clinica)
      .execute('insertarHistoriaConDetalle');

    res.status(200).json({
      success: true,
      mensaje: 'Historia clínica y detalle insertados correctamente',
      id_historia_clinica: historiaResult.recordset[0]?.id_historia_clinica,
      paciente: {
        nombres: paciente.nombres,
        apellido: paciente.apellido,
        dni
      }
    });

  } catch (error) {
    console.error('Error al insertar historia clínica con detalle:', error);
    res.status(500).json({
      success: false,
      mensaje: error.message
    });
  }
};


exports.getHistoriasPorDni = async (req, res) => {
  const { dni } = req.params;

  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input('dni', sql.NVarChar(20), dni)
      .execute('getHistoriasPorDniPaciente');

    res.status(200).json({
      success: true,
      historias: result.recordset
    });
  } catch (error) {
    console.error('Error al obtener historias por DNI:', error);
    res.status(500).json({
      success: false,
      mensaje: error.message || 'Error del servidor'
    });
  }
};


// Obtener historias por paciente
exports.getHistoriasPorPaciente = async (req, res) => {
  const { id_paciente } = req.params;

  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input('id_paciente', sql.Int, id_paciente)
      .execute('getHistoriasPorPaciente');

    res.status(200).json({
      success: true,
      historias: result.recordset
    });
  } catch (error) {
    console.error('Error al obtener historias por paciente:', error);
    res.status(500).json({ success: false, mensaje: error.message });
  }
};

// Obtener historias por médico
exports.getHistoriasPorMedico = async (req, res) => {
  const { id_medico } = req.params;

  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input('id_medico', sql.Int, id_medico)
      .execute('getHistoriasPorMedico');

    res.status(200).json({
      success: true,
      historias: result.recordset
    });
  } catch (error) {
    console.error('Error al obtener historias por médico:', error);
    res.status(500).json({ success: false, mensaje: error.message });
  }
};