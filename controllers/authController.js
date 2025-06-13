const argon2 = require('argon2');
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
      .query(`SELECT * FROM Usuarios WHERE DNI = @DNI OR email = @email OR username = @username`);

    if (check.recordset.length > 0) {
      const existente = check.recordset[0];
      if (existente.DNI === DNI) return res.status(409).json({ error: 'DNI ya registrado' });
      if (existente.email === email) return res.status(409).json({ error: 'Email ya registrado' });
      if (existente.username === username) return res.status(409).json({ error: 'Username ya registrado' });
    }

    if (id_rol === 2 && !id_especialidad) {
      return res.status(400).json({ error: 'Falta id_especialidad para médicos' });
    }

    // Hashear con argon2
    const hashedPassword = await argon2.hash(contrasena);

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

    if (!hashedPassword) {
      return res.status(500).json({ error: 'Error con la contraseña almacenada' });
    }

    // Verificar contraseña con argon2
    const validPassword = await argon2.verify(hashedPassword, contrasena);

    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const payload = {
      id: user.id,
      username: user.username,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    delete user.contrasena;

    res.status(200).json({ user, token });

  } catch (error) {
    console.error('Error en loginUser:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};
