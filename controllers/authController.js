const bcrypt = require('bcrypt');
const connectDB = require('../config/db');
const sql = require('mssql');

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
      id_especialidad = null // puede ser null por defecto
    } = req.body;

    // Validación obligatoria
    if (!DNI || !nombres || !apellido || !email || !username || !telefono || !contrasena || !id_rol) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Validar especialidad si el usuario es médico
    if (id_rol === 2 && !id_especialidad) {
      return res.status(400).json({ error: 'Falta id_especialidad para registrar un médico' });
    }

    const pool = await connectDB();

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar el usuario usando un procedimiento almacenado
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

    res.status(200).json({ message: 'Usuario registrado correctamente' });

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
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
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

    // La contraseña en la base de datos debe estar hasheada
    const hashedPassword = user.contrasena;

    // Comparar la contraseña ingresada con el hash almacenado
    const isMatch = await bcrypt.compare(contrasena, hashedPassword);

    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Login exitoso
    return res.status(200).json({
      message: 'Login exitoso',
      usuario: {
        id_usuario: user.id_usuario,
        username: user.username,
        nombres: user.nombres,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono,
        id_rol: user.id_rol
      }
    });

  } catch (error) {
    console.error('Error al loguear:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
