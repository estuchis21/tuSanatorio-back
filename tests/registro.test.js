const { registerUser, loginUser } = require('../controllers/authController');
const { connectDB } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../config/db');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('registerUser', () => {
  let req, res, mockRequest;

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockRequest = { input: jest.fn().mockReturnThis(), execute: jest.fn() };
    connectDB.mockResolvedValue({ request: () => mockRequest });
    bcrypt.hash.mockResolvedValue('hashedPassword');
  });

  it('debe devolver 400 si faltan campos obligatorios', async () => {
    req.body = { DNI: 12345678 };
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Faltan campos obligatorios' });
  });

  it('debe devolver 409 si DNI ya existe', async () => {
    req.body = {
      DNI: 12345678, nombres: 'Juan', apellido: 'Perez',
      email: 'test@example.com', username: 'juanp',
      telefono: '123456789', contrasena: '1234',
      id_rol: 1, id_obra_social: 2,
    };
    mockRequest.execute.mockResolvedValueOnce({
      recordset: [{ DNI: 12345678 }],
    });
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'DNI ya registrado' });
  });

  it('debe devolver 400 si id_rol=2 y no hay id_especialidad', async () => {
    req.body = {
      DNI: 12345678, nombres: 'Juan', apellido: 'Perez',
      email: 'test@example.com', username: 'juanp',
      telefono: '123456789', contrasena: '1234',
      id_rol: 2, id_obra_social: 2,
    };
    mockRequest.execute.mockResolvedValueOnce({ recordset: [] });
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Falta id_especialidad para médicos' });
  });

  it('debe registrar usuario correctamente', async () => {
    req.body = {
      DNI: 12345678, nombres: 'Juan', apellido: 'Perez',
      email: 'test@example.com', username: 'juanp',
      telefono: '123456789', contrasena: '1234',
      id_rol: 1, id_obra_social: 2,
    };
    mockRequest.execute
      .mockResolvedValueOnce({ recordset: [] })
      .mockResolvedValueOnce({});
    await registerUser(req, res);
    expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuario registrado correctamente' });
  });

  it('debe retornar 500 si hay error en la conexión', async () => {
    connectDB.mockRejectedValueOnce(new Error('DB error'));
    req.body = {
      DNI: 12345678, nombres: 'Juan', apellido: 'Perez',
      email: 'test@example.com', username: 'juanp',
      telefono: '123456789', contrasena: '1234',
      id_rol: 1, id_obra_social: 2,
    };
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al registrar el usuario' });
  });
});