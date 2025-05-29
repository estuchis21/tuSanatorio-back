const bcrypt = require('bcrypt');
const connectDB = require('../config/db');

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
      rol_id,
      id_especialidad
    } = req.body;

    // Validación básica
    if (!DNI || !nombres || !apellido || !email || !username || !telefono || !contrasena || !rol_id || !id_especialidad) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Validar especialidad si es médico
    if (rol_id === 1 && !id_especialidad) {
      return res.status(400).json({ error: 'Falta id_especialidad para registrar un médico' });
    }

    const pool = await connectDB();

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Llamar al procedimiento almacenado
    await pool.request()
      .input('DNI', DNI)
      .input('nombres', nombres)
      .input('apellido', apellido)
      .input('email', email)
      .input('username', username)
      .input('telefono', telefono)
      .input('contrasena', hashedPassword)
      .input('rol_id', rol_id)
      .input('id_especialidad', id_especialidad || null)
      .execute('insertarUsuario');

    res.status(200).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('Error en registerUser:', error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, contrasena } = req.body;

    if (!username || !contrasena) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const pool = await connectDB();
    const result = await pool
      .request()
      .input('username', username)
      .execute('getUserByUsername');

    const user = result.recordset[0];

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(contrasena, user.contrasena);

    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    res.status(200).json({
      message: 'Login exitoso',
      usuario: {
        id_usuario: user.id_usuario,
        username: user.username,
        nombres: user.nombres,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono,
        rol_id: user.id_rol
      }
    });
  } catch (error) {
    console.error('Error al loguear:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};