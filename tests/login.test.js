// tests/login.test.js
const { loginUser } = require('../controllers/authController');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');

// Mockeamos connectDB
jest.mock('../config/db', () => ({
  connectDB: jest.fn(),
}));

const { connectDB } = require('../config/db');

describe('loginUser', () => {
  let req, res, mockRequest;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockRequest = { input: jest.fn().mockReturnThis(), execute: jest.fn() };
  });

  test('debe retornar 400 si faltan datos', async () => {
    req.body = {}; // no username ni contraseña
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Faltan datos' });
  });

  test('debe retornar 404 si usuario no encontrado', async () => {
    req.body = { username: 'juan', contrasena: '123' };
    connectDB.mockResolvedValue({ request: () => mockRequest });
    mockRequest.execute.mockResolvedValue({ recordset: [] }); // usuario no existe

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
  });

  test('debe retornar 401 si contraseña incorrecta', async () => {
    req.body = { username: 'juan', contrasena: '254444' };
    connectDB.mockResolvedValue({ request: () => mockRequest });
    mockRequest.execute.mockResolvedValue({
      recordset: [{ contrasena: await bcrypt.hash('contrasena', 10), id_usuario: 1, username: 'juan' }]
    });

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Contraseña incorrecta' });
  });

  test('debe retornar 200 y token si login exitoso', async () => {
    req.body = { username: 'juan', contrasena: 'passwordReal' };
    connectDB.mockResolvedValue({ request: () => mockRequest });
    mockRequest.execute.mockResolvedValue({
      recordset: [{ contrasena: await bcrypt.hash('passwordReal', 10), id_usuario: 1, username: 'juan' }]
    });

    // Mockeamos jwt.sign
    jest.spyOn(jwt, 'sign').mockReturnValue('fake-jwt-token');

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      token: 'fake-jwt-token',
      user: { id_usuario: 1, username: 'juan' }
    });
  });

  it('debe retornar 500 si hay error en el try', async () => {
    req.body = { username: 'juan', contrasena: '123' };
    connectDB.mockImplementation(() => { throw new Error('DB caída'); });

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al iniciar sesión' });
  });
});
