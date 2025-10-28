// __tests__/registerUser.test.js
const { registerUser } = require('../controllers/authController');
const {connectDB} = require('../config/db');
const bcrypt = require('bcrypt');
const sql = require('mssql');

// Mocks
jest.mock('../config/db');
jest.mock('bcrypt');

describe('registerUser', () => {
  let req, res, poolMock, requestMock;

  beforeEach(() => {
    // Mock de req y res
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock de pool y request de mssql
    requestMock = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn()
    };
    poolMock = {
      request: jest.fn(() => requestMock)
    };

    connectDB.mockResolvedValue(poolMock);
    bcrypt.hash.mockResolvedValue('hashedPassword');
  });

  it('debe devolver 400 si faltan campos obligatorios', async () => {
    req.body = { DNI: 12345678 }; // Campos incompletos
    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Faltan campos obligatorios' });
  });

  it('debe devolver 409 si DNI, email o username ya existen', async () => {
    req.body = {
      DNI: 12345678,
      nombres: 'Juan',
      apellido: 'Perez',
      email: 'test@example.com',
      username: 'juanp',
      telefono: '123456789',
      contrasena: '1234',
      id_rol: 1,
      id_obra_social: 2
    };

    requestMock.execute.mockResolvedValueOnce({
      recordset: [{ DNI: 12345678, email: 'otro@example.com', username: 'otrouser' }]
    });

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'DNI ya registrado' });
  });

  it('debe devolver 400 si id_rol=2 y no hay id_especialidad', async () => {
    req.body = {
      DNI: 12345678,
      nombres: 'Juan',
      apellido: 'Perez',
      email: 'test@example.com',
      username: 'juanp',
      telefono: '123456789',
      contrasena: '1234',
      id_rol: 2, // médico
      id_obra_social: 2
    };

    requestMock.execute.mockResolvedValueOnce({ recordset: [] });

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Falta id_especialidad para médicos' });
  });

  it('debe registrar usuario correctamente', async () => {
    req.body = {
      DNI: 12345678,
      nombres: 'Juan',
      apellido: 'Perez',
      email: 'test@example.com',
      username: 'juanp',
      telefono: '123456789',
      contrasena: '1234',
      id_rol: 1,
      id_obra_social: 2
    };

    requestMock.execute.mockResolvedValueOnce({ recordset: [] }); // check duplicados
    requestMock.execute.mockResolvedValueOnce({}); // insertarUsuario

    await registerUser(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
    expect(poolMock.request).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuario registrado correctamente' });
  });

  it('debe manejar errores y devolver 500', async () => {
    req.body = {
      DNI: 12345678,
      nombres: 'Juan',
      apellido: 'Perez',
      email: 'test@example.com',
      username: 'juanp',
      telefono: '123456789',
      contrasena: '1234',
      id_rol: 1,
      id_obra_social: 2
    };

    connectDB.mockRejectedValueOnce(new Error('DB error'));

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al registrar el usuario' });
  });
});
