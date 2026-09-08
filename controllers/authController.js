const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { pool } = require('../config/db');


// =====================================================
// EJECUTAR PROCEDURE CON REFCURSOR
// =====================================================

const ejecutarProcedure = async (
  nombreProcedure,
  parametros = []
) => {

  const client = await pool.connect();

  const cursor =
    `cur_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  try {

    await client.query('BEGIN');

    const placeholders = parametros
      .map((_, index) => `$${index + 1}`)
      .join(', ');

    const argumentos = placeholders
      ? `${placeholders}, '${cursor}'`
      : `'${cursor}'`;

    console.log(
      `🔹 Ejecutando procedure con cursor: ${nombreProcedure}`
    );

    await client.query(
      `CALL "${nombreProcedure}"(${argumentos})`,
      parametros
    );

    const result = await client.query(
      `FETCH ALL FROM "${cursor}"`
    );

    await client.query('COMMIT');

    return result.rows;

  } catch (error) {

    try {
      await client.query('ROLLBACK');
    } catch (_) {}

    console.error(
      `❌ Error ejecutando ${nombreProcedure}:`,
      error
    );

    throw error;

  } finally {

    client.release();

  }
};


// =====================================================
// EJECUTAR PROCEDURE SIN CURSOR
// =====================================================

const ejecutarProcedureSinCursor = async (
  nombreProcedure,
  parametros = []
) => {

  const client = await pool.connect();

  try {

    await client.query('BEGIN');

    const placeholders = parametros
      .map((_, index) => `$${index + 1}`)
      .join(', ');

    console.log(
      `🔹 Ejecutando procedure sin cursor: ${nombreProcedure}`
    );

    await client.query(
      `CALL "${nombreProcedure}"(${placeholders})`,
      parametros
    );

    await client.query('COMMIT');

    return true;

  } catch (error) {

    try {
      await client.query('ROLLBACK');
    } catch (_) {}

    console.error(
      `❌ Error ejecutando ${nombreProcedure}:`,
      error
    );

    throw error;

  } finally {

    client.release();

  }
};


// =====================================================
// LOGIN
// =====================================================

const loginUser = async (req, res) => {

  try {

    const {
      username,
      contrasena
    } = req.body;

    if (!username || !contrasena) {

      return res.status(400).json({
        error:
          'Username y contraseña son obligatorios'
      });

    }

    const usuarios =
      await ejecutarProcedure(
        'getuserbyusername',
        [username]
      );

    if (
      !usuarios ||
      usuarios.length === 0
    ) {

      return res.status(401).json({
        error:
          'Usuario o contraseña incorrectos'
      });

    }

    const usuario = usuarios[0];

    const passwordCorrecta =
      await bcrypt.compare(
        contrasena,
        usuario.contrasena
      );

    if (!passwordCorrecta) {

      return res.status(401).json({
        error:
          'Usuario o contraseña incorrectos'
      });

    }

    const token =
      jwt.sign(
        {
          id_usuario:
            usuario.id_usuario,

          username:
            usuario.username,

          id_rol:
            usuario.id_rol,

          id_paciente:
            usuario.id_paciente || null
        },

        process.env.JWT_SECRET,

        {
          expiresIn: '8h'
        }
      );

    const {
      contrasena: _contrasena,
      ...usuarioSeguro
    } = usuario;

    return res.status(200).json({

      message:
        'Login exitoso',

      token,

      user:
        usuarioSeguro

    });

  } catch (error) {

    console.error(
      '❌ Error en loginUser:',
      error
    );

    return res.status(500).json({

      error:
        'Error interno del servidor',

      detail:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined

    });

  }

};


// =====================================================
// REGISTRO
// =====================================================

const registerUser = async (req, res) => {

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
      id_especialidad,
      id_obra_social
    } = req.body;


    // =====================================================
    // VALIDACIONES
    // =====================================================

    if (
      !DNI ||
      !nombres ||
      !apellido ||
      !email ||
      !username ||
      !telefono ||
      !contrasena ||
      !id_rol
    ) {

      return res.status(400).json({
        error:
          'Faltan datos obligatorios'
      });

    }


    // =====================================================
    // ROL
    // =====================================================

    const rol = Number(id_rol);

    if (
      rol !== 1 &&
      rol !== 2
    ) {

      return res.status(400).json({
        error:
          'El rol debe ser 1 (Paciente) o 2 (Médico)'
      });

    }


    // =====================================================
    // ESPECIALIDAD
    // =====================================================

    let especialidad = null;

    if (rol === 2) {

      if (
        id_especialidad === undefined ||
        id_especialidad === null ||
        id_especialidad === ''
      ) {

        return res.status(400).json({
          error:
            'Debe seleccionar una especialidad para el médico'
        });

      }

      especialidad =
        Number(id_especialidad);

      if (
        !Number.isInteger(especialidad)
      ) {

        return res.status(400).json({
          error:
            'La especialidad seleccionada no es válida'
        });

      }

    }


    // =====================================================
    // OBRA SOCIAL
    // =====================================================

    let obraSocial = null;

    if (
      id_obra_social !== undefined &&
      id_obra_social !== null &&
      id_obra_social !== ''
    ) {

      obraSocial =
        Number(id_obra_social);

      if (
        !Number.isInteger(obraSocial)
      ) {

        return res.status(400).json({
          error:
            'La obra social seleccionada no es válida'
        });

      }

    }


    // =====================================================
    // VERIFICAR EXISTENCIA
    // =====================================================

    const existente =
      await ejecutarProcedure(
        'EXISTENTE',
        [
          Number(DNI),
          email,
          username
        ]
      );

    if (
      existente &&
      existente.length > 0
    ) {

      return res.status(409).json({
        error:
          'Ya existe un usuario con alguno de los datos ingresados'
      });

    }


    // =====================================================
    // HASH
    // =====================================================

    const passwordHash =
      await bcrypt.hash(
        contrasena,
        10
      );


    // =====================================================
    // INSERTAR
    // =====================================================

    await ejecutarProcedureSinCursor(
      'insertarusuario',
      [
        Number(DNI),
        nombres,
        apellido,
        email,
        username,
        telefono,
        passwordHash,
        rol,
        especialidad,
        obraSocial
      ]
    );


    // =====================================================
    // RECUPERAR USUARIO
    // =====================================================

    const usuarios =
      await ejecutarProcedure(
        'getuserbyusername',
        [username]
      );

    if (
      !usuarios ||
      usuarios.length === 0
    ) {

      return res.status(500).json({
        error:
          'El usuario fue creado pero no se pudo recuperar'
      });

    }

    const usuario =
      usuarios[0];


    // =====================================================
    // RESPUESTA
    // =====================================================

    return res.status(201).json({

      message:
        'Usuario registrado correctamente',

      user: {

        id_usuario:
          usuario.id_usuario,

        nombres:
          usuario.nombres,

        apellido:
          usuario.apellido,

        DNI:
          usuario.dni,

        email:
          usuario.email,

        username:
          usuario.username,

        telefono:
          usuario.telefono,

        id_rol:
          usuario.id_rol,

        id_paciente:
          usuario.id_paciente || null

      }

    });

  } catch (error) {

    console.error(
      '❌ Error en registerUser:',
      error
    );

    if (
      error.code === '23505'
    ) {

      return res.status(409).json({
        error:
          'Ya existe un usuario con alguno de los datos ingresados'
      });

    }

    return res.status(500).json({

      error:
        'Error interno del servidor',

      detail:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined

    });

  }

};


// =====================================================
// ESPECIALIDADES
// =====================================================

const getEspecialidades = async (
  req,
  res
) => {

  try {

    const result =
      await ejecutarProcedure(
        'getEspecialidades'
      );

    return res.status(200).json(
      result
    );

  } catch (error) {

    console.error(
      '❌ Error getEspecialidades:',
      error
    );

    return res.status(500).json({
      error:
        'Error al obtener especialidades'
    });

  }

};


// =====================================================
// PACIENTE POR USUARIO
// =====================================================

const getPacienteByUsuarioId = async (
  req,
  res
) => {

  try {

    const {
      id_usuario
    } = req.params;

    const result =
      await ejecutarProcedure(
        'verPacientePorIdUsuario',
        [
          Number(id_usuario)
        ]
      );

    return res.status(200).json(
      result
    );

  } catch (error) {

    console.error(
      '❌ Error getPacienteByUsuarioId:',
      error
    );

    return res.status(500).json({
      error:
        'Error al obtener paciente'
    });

  }

};


// =====================================================
// MÉDICO POR USUARIO
// =====================================================

const getMedicoByUsuarioId = async (
  req,
  res
) => {

  try {

    const {
      id_usuario
    } = req.params;

    const result =
      await ejecutarProcedure(
        'verMedicoPorIdUsuario',
        [
          Number(id_usuario)
        ]
      );

    return res.status(200).json(
      result
    );

  } catch (error) {

    console.error(
      '❌ Error getMedicoByUsuarioId:',
      error
    );

    return res.status(500).json({
      error:
        'Error al obtener médico'
    });

  }

};


// =====================================================
// ESPECIALIDADES POR MÉDICO
// =====================================================

const getEspecialidadesPorMedico = async (
  req,
  res
) => {

  try {

    const {
      id_medico
    } = req.params;

    const result =
      await ejecutarProcedure(
        'getEspecialidadesPorMédico',
        [
          Number(id_medico)
        ]
      );

    return res.status(200).json(
      result
    );

  } catch (error) {

    console.error(
      '❌ Error getEspecialidadesPorMedico:',
      error
    );

    return res.status(500).json({
      error:
        'Error al obtener especialidades del médico'
    });

  }

};


// =====================================================
// MÉDICOS POR ESPECIALIDAD
// =====================================================

const getMedicosPorEspecialidad = async (
  req,
  res
) => {

  try {

    const {
      id_especialidad
    } = req.params;

    const result =
      await ejecutarProcedure(
        'MedicosPorEspecialidad',
        [
          Number(id_especialidad)
        ]
      );

    return res.status(200).json(
      result
    );

  } catch (error) {

    console.error(
      '❌ Error getMedicosPorEspecialidad:',
      error
    );

    return res.status(500).json({
      error:
        'Error al obtener médicos por especialidad'
    });

  }

};


// =====================================================
// HORARIOS
// =====================================================

const getHorariosPorMedico = async (
  req,
  res
) => {

  try {

    const {
      id_medico
    } = req.params;

    const result =
      await ejecutarProcedure(
        'horariosPorMedico',
        [
          Number(id_medico)
        ]
      );

    return res.status(200).json(
      result
    );

  } catch (error) {

    console.error(
      '❌ Error getHorariosPorMedico:',
      error
    );

    return res.status(500).json({
      error:
        'Error al obtener horarios del médico'
    });

  }

};


// =====================================================
// USUARIO POR ID
// =====================================================

const getUsuarioById = async (
  req,
  res
) => {

  try {

    const {
      id_usuario
    } = req.params;

    const result =
      await ejecutarProcedure(
        'sp_GetUsuarioById',
        [
          Number(id_usuario)
        ]
      );

    return res.status(200).json(
      result
    );

  } catch (error) {

    console.error(
      '❌ Error getUsuarioById:',
      error
    );

    return res.status(500).json({
      error:
        'Error al obtener usuario'
    });

  }

};


// =====================================================
// OBRAS SOCIALES POR MÉDICO
// =====================================================

const getObrasPorMedico = async (
  req,
  res
) => {

  try {

    const {
      id_medico
    } = req.params;

    const result =
      await ejecutarProcedure(
        'GetObrasSocialesPorMedico',
        [
          Number(id_medico)
        ]
      );

    return res.status(200).json(
      result
    );

  } catch (error) {

    console.error(
      '❌ Error getObrasPorMedico:',
      error
    );

    return res.status(500).json({
      error:
        'Error al obtener obras sociales del médico'
    });

  }

};


// =====================================================
// OBRAS SOCIALES POR PACIENTE
// =====================================================

const getObrasPorPaciente = async (
  req,
  res
) => {

  try {

    const {
      id_paciente
    } = req.params;

    const result =
      await ejecutarProcedure(
        'GetObrasSocialesPorPaciente',
        [
          Number(id_paciente)
        ]
      );

    return res.status(200).json(
      result
    );

  } catch (error) {

    console.error(
      '❌ Error getObrasPorPaciente:',
      error
    );

    return res.status(500).json({
      error:
        'Error al obtener obras sociales del paciente'
    });

  }

};


// =====================================================
// ACTUALIZAR PERFIL
// =====================================================

const actualizarPerfil = async (
  req,
  res
) => {

  try {

    const {
      id_usuario
    } = req.params;

    const {
      nombres,
      apellido,
      DNI,
      email,
      username,
      telefono
    } = req.body;

    const result =
      await ejecutarProcedure(
        'actualizarPerfil',
        [
          Number(id_usuario),
          DNI || null,
          nombres || null,
          apellido || null,
          email || null,
          username || null,
          telefono || null
        ]
      );

    return res.status(200).json({

      message:
        'Perfil actualizado correctamente',

      data:
        result

    });

  } catch (error) {

    console.error(
      '❌ Error actualizarPerfil:',
      error
    );

    if (
      error.code === '23505'
    ) {

      return res.status(409).json({
        error:
          'Uno de los datos ingresados ya está registrado'
      });

    }

    return res.status(500).json({
      error:
        'Error al actualizar perfil'
    });

  }

};


// =====================================================
// BUSCAR PACIENTES
// =====================================================

const buscarPacientesPorTexto = async (
  req,
  res
) => {

  try {

    const {
      texto
    } = req.query;

    if (!texto) {

      return res.status(400).json({
        error:
          'Debe ingresar un texto para buscar'
      });

    }

    const result =
      await ejecutarProcedure(
        'BuscarPacientePorTexto',
        [texto]
      );

    return res.status(200).json(
      result
    );

  } catch (error) {

    console.error(
      '❌ Error buscarPacientesPorTexto:',
      error
    );

    return res.status(500).json({
      error:
        'Error al buscar pacientes'
    });

  }

};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

  loginUser,
  registerUser,
  getEspecialidades,
  getPacienteByUsuarioId,
  getMedicoByUsuarioId,
  getEspecialidadesPorMedico,
  getMedicosPorEspecialidad,
  getHorariosPorMedico,
  getUsuarioById,
  getObrasPorMedico,
  getObrasPorPaciente,
  actualizarPerfil,
  buscarPacientesPorTexto

};