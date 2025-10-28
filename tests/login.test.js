const { registerUser, loginUser } = require('../controllers/authController');
const { connectDB } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../config/db');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');


describe('loginUser', () => {
  let req, res, mockRequest;

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockRequest = { input: jest.fn().mockReturnThis(), execute: jest.fn() };
    connectDB.mockResolvedValue({ request: () => mockRequest });
  });

  test('debe retornar 400 si faltan datos', async () => {
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Faltan datos' });
  });

  test('debe retornar 401 si usuario no encontrado', async () => {
    req.body = { username: 'juan', contrasena: '123' };
    mockRequest.execute.mockResolvedValue({ recordset: [] });
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
  });

  test('debe retornar 401 si contraseña incorrecta', async () => {
    req.body = { username: 'juan', contrasena: '123' };
    mockRequest.execute.mockResolvedValue({
      recordset: [{ contrasena: 'fakeHash', id_usuario: 1 }],
    });
    bcrypt.compare.mockResolvedValue(false);
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Contraseña incorrecta' });
  });

  test('debe retornar 200 y token si login exitoso', async () => {
    req.body = { username: 'juan', contrasena: 'passwordReal' };
    mockRequest.execute.mockResolvedValue({
      recordset: [{ contrasena: 'hashed', id_usuario: 1, username: 'juan' }],
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('fake-jwt-token');
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      token: 'fake-jwt-token',
      user: { id_usuario: 1, username: 'juan' },
    });
  });

  test('debe retornar 500 si hay error en el try', async () => {
    connectDB.mockImplementation(() => { throw new Error('DB caída'); });
    req.body = { username: 'juan', contrasena: '123' };
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al iniciar sesión' });
  });
});