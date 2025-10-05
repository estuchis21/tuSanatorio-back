const sql = require('mssql');
const {connectDB} = require('../config/db');

// Insertar historia clínica con detalle
exports.insertarHistoria = async (req, res) => {
  const { id_paciente, id_medico, historia_clinica } = req.body;

  if (!id_paciente || !id_medico || !historia_clinica) {
    return res.status(400).json({
      success: false,
      mensaje: "Faltan parámetros requeridos: id_paciente, id_medico o historia_clinica"
    });
  }

  try {
    const pool = await connectDB();
    await pool.request()
      .input('id_paciente', sql.Int, id_paciente)
      .input('id_medico', sql.Int, id_medico)
      .input('historia_clinica', sql.NVarChar(sql.MAX), historia_clinica)
      .execute('insertarHistoriaConDetalle');


    res.status(200).json({
      success: true,
      mensaje: 'Historia clínica y detalle insertados correctamente',
    });

  } catch (error) {
    console.error('Error al insertar historia clínica con detalle:', error);
    res.status(500).json({
      success: false,
      mensaje: error.message
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