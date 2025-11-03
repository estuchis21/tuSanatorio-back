const { loginUser } = require('../controllers/authController');
const connectDB = require('../config/db');

jest.mock('../config/db', () => jest.fn());

describe('loginUser', () => {
  let req, res;

  beforeEach(() => {
    req = { body: { email: 'test@mail.com', password: '1234' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('debería iniciar sesión correctamente', async () => {
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ recordset: [{ email: 'test@mail.com', password: '1234' }] }),
    };
    connectDB.mockResolvedValue({ request: () => mockRequest });

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Login exitoso',
      user: { email: 'test@mail.com', password: '1234' },
    });
  });

  it('debería devolver error 500 si la DB falla', async () => {
    connectDB.mockImplementationOnce(async () => { throw new Error('DB caída'); });

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al iniciar sesión' });
  });
});
