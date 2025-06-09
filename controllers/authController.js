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

    const hashedPassword = await bcrypt.hash(contrasena);

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



// LOGIN SIMPLE
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

    const hashedPassword = user.contrasena;
    console.log(hashedPassword);

    if(contrasena != user.contrasena){
      res.status(401).json({error: 'Las contraseñas no coinciden'})
    }

    const compare = await bcrypt.compare(contrasena, hashedPassword);
    if(!compare){
      res.status(401).json({error: 'No hay contraseña comparable'});
    }

    res.status(200).json({user});
  } catch (error) {
    console.error('Error en loginUser:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};