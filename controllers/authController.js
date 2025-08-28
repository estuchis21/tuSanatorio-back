const bcrypt = require('bcrypt');
const connectDB = require('../config/db');
const sql = require('mssql');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_aqui';

// REGISTRO DE USUARIO
exports.registerUser = async (req, res) => {
  try {
    const {
      DNI,
      nombres,
      apellido,
      email,
      username,
      telefono,
      contrasena,
      id_rol,
      id_especialidad = null
    } = req.body;

    if (!DNI || !nombres || !apellido || !email || !username || !telefono || !contrasena || !id_rol) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const pool = await connectDB();

    // Verificar duplicados
    const check = await pool.request()
      .input('DNI', sql.BigInt, DNI)
      .input('email', sql.VarChar, email)
      .input('username', sql.VarChar, username)
      .execute(`EXISTENTE`);

    if (check.recordset.length > 0) {
      const existente = check.recordset[0];
      if (existente.DNI === DNI) return res.status(409).json({ error: 'DNI ya registrado' });
      if (existente.email === email) return res.status(409).json({ error: 'Email ya registrado' });
      if (existente.username === username) return res.status(409).json({ error: 'Username ya registrado' });
    }

    if (id_rol === 2 && !id_especialidad) {
      return res.status(400).json({ error: 'Falta id_especialidad para médicos' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    await pool.request()
      .input('DNI', sql.BigInt, DNI)
      .input('nombres', sql.VarChar, nombres)
      .input('apellido', sql.VarChar, apellido)
      .input('email', sql.VarChar, email)
      .input('username', sql.VarChar, username)
      .input('telefono', sql.VarChar, telefono)
      .input('contrasena', sql.VarChar, hashedPassword)
      .input('id_rol', sql.Int, id_rol)
      .input('id_especialidad', sql.Int, id_especialidad)
      .execute('insertarUsuario');

    res.status(201).json({ message: 'Usuario registrado correctamente' });

  } catch (error) {
    console.error('Error en registerUser:', error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

// LOGIN DE USUARIO
exports.loginUser = async (req, res) => {
  try {
    const { username, contrasena } = req.body;

    if (!username || !contrasena) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const pool = await connectDB();

    const result = await pool
      .request()
      .input('username', sql.VarChar, username)
      .execute('getUserByUsername');

    const user = result.recordset[0];

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const hashedPassword = user.contrasena;

    const compare = await bcrypt.compare(contrasena, hashedPassword);

    if (!compare) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const payload = {
      id: user.id_usuario,
      username: user.username
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    delete user.contrasena;

    res.status(200).json({ token, user }); // 👈 agregá esto


  } catch (error) {
    console.error('Error en loginUser:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

exports.getEspecialidades = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().execute("getEspecialidades");
    const especialidades = result.recordset;

    return res.status(200).json(especialidades);
  } catch (error) {
    console.error("Error al obtener especialidades:", error);
    res.status(500).json({ message: "Error al obtener especialidades" });
  }
}

exports.getEspecialidadesPorMedico = async (req, res) => {
  const { id_medico } = req.params;

  if (id_medico == null) {
    return res.status(404).json({ error: "No existe tal médico en tal especialidad" });
  }

  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('id_medico', sql.Int, id_medico)
      .execute("getEspecialidadesPorMédico");

    return res.status(200).json(result.recordset); // recordset es síncrono
  } catch (error) {
    console.error("Error al obtener especialidades por médico:", error);
    return res.status(500).json({ message: "Error al obtener especialidades por médico." });
  }
};


exports.getMedicosPorEspecialidad = async (req, res) => {
  try {
    const { id_especialidad } = req.params;

    if (!id_especialidad || isNaN(Number(id_especialidad))) {
      return res.status(400).json({ error: "Falta o es inválido el id_especialidad" });
    }

    const pool = await connectDB();

    const result = await pool.request()
      .input("id_especialidad", sql.Int, Number(id_especialidad))
      .execute("MedicosPorEspecialidad"); // el nombre del SP

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({ error: "No se encontraron médicos para esa especialidad" });
    }

    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener médicos por especialidad:", error);
    res.status(500).json({ error: "Error al obtener médicos por especialidad" });
  }
};



// Obtener id_paciente según id_usuario
exports.getPacienteByUsuarioId = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    if (!id_usuario || isNaN(Number(id_usuario))) {
      return res.status(400).json({ error: "Falta o es inválido el id_usuario" });
    }

    const pool = await connectDB();

    const result = await pool.request()
      .input('id_usuario', sql.Int, Number(id_usuario))
      .query('SELECT id_paciente FROM Pacientes WHERE id_usuario = @id_usuario');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado para ese usuario' });
    }

    res.json({ id_paciente: result.recordset[0].id_paciente });
  } catch (error) {
    console.error('Error en getPacienteByUsuarioId:', error);
    res.status(500).json({ error: 'Error al obtener paciente' });
  }
};

// (Opcional) Obtener id_medico según id_usuario
exports.getMedicoByUsuarioId = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    if (!id_usuario || isNaN(Number(id_usuario))) {
      return res.status(400).json({ error: "Falta o es inválido el id_usuario" });
    }

    const pool = await connectDB();

    const result = await pool.request()
      .input('id_usuario', sql.Int, Number(id_usuario))
      .query('SELECT id_medico FROM Medicos WHERE id_usuario = @id_usuario');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Médico no encontrado para ese usuario' });
    }

    res.json({ id_medico: result.recordset[0].id_medico });
  } catch (error) {
    console.error('Error en getMedicoByUsuarioId:', error);
    res.status(500).json({ error: 'Error al obtener médico' });
  }
};
