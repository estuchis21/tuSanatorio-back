const { registerUser } = require('../controllers/authController');
const connectDB = require('../config/db');

jest.mock('../config/db', () => jest.fn());

describe('registerUser', () => {
  let req, res;

  beforeEach(() => {
    req = { body: { email: 'new@mail.com', password: '1234' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('debería registrar usuario correctamente', async () => {
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({}),
    };
    connectDB.mockResolvedValue({ request: () => mockRequest });

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuario registrado' });
  });

  it('debería devolver error 500 si la DB falla', async () => {
    connectDB.mockImplementationOnce(async () => { throw new Error('DB error'); });

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al registrar el usuario' });
  });
});
