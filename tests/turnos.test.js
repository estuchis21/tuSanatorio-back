const { asignarTurno } = require('../controllers/turnosController');
const connectDB = require('../config/db');

jest.mock('../config/db', () => jest.fn());

describe('asignarTurno', () => {
  let req, res;

  beforeEach(() => {
    req = { body: { paciente: 'Juan', fecha: '2025-10-28' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('debería asignar turno correctamente', async () => {
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({
        recordset: [{
          medicoNombre: 'Maria',
          medicoApellido: 'Lopez',
          especialidadNombre: 'Cardio',
          fecha_turno: '2025-10-28',
          hora_inicio: '10:00',
          hora_fin: '11:00',
        }],
      }),
    };
    connectDB.mockResolvedValue({ request: () => mockRequest });

    await asignarTurno(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Turno asignado' });
  });

  it('debería devolver 500 si la DB falla', async () => {
    connectDB.mockImplementationOnce(async () => { throw new Error('DB caída'); });

    await asignarTurno(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al asignar turno' });
  });
});
