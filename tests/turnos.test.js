const { asignarTurno } = require('../controllers/turnosController');
const { connectDB } = require('../config/db');
const { enviarWhatsAppTurno } = require('../controllers/enviarTurnoPorWhatsapp');

jest.mock('../config/db');
jest.mock('../controllers/enviarTurnoPorWhatsapp');

describe('asignarTurno', () => {
  let req, res, mockRequest;

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockRequest = { input: jest.fn().mockReturnThis(), execute: jest.fn() };
    connectDB.mockResolvedValue({ request: () => mockRequest });
    enviarWhatsAppTurno.mockResolvedValue();
  });

  it('debe retornar 400 si faltan campos', async () => {
    await asignarTurno(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Faltan campos obligatorios' });
  });

  it('debe retornar 409 si turno ya asignado', async () => {
    req.body = { id_paciente: 1, id_turno: 2, id_obra_social: 1 };
    mockRequest.execute.mockResolvedValueOnce({ recordset: [1] });
    await asignarTurno(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'El turno ya está asignado' });
  });

  it('debe retornar 409 si turno no disponible', async () => {
    req.body = { id_paciente: 1, id_turno: 2, id_obra_social: 1 };
    mockRequest.execute
      .mockResolvedValueOnce({ recordset: [] })
      .mockResolvedValueOnce({ recordset: [] });
    await asignarTurno(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'El turno no está disponible' });
  });

  it('debe asignar turno y enviar WhatsApp', async () => {
    req.body = { id_paciente: 1, id_turno: 2, id_obra_social: 1 };
    mockRequest.execute
      .mockResolvedValueOnce({ recordset: [] })
      .mockResolvedValueOnce({ recordset: [{ id_turno: 2 }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ recordset: [{ nombres: 'Juan', apellido: 'Perez', telefono: '1234' }] })
      .mockResolvedValueOnce({ recordset: [{ medicoNombre: 'Maria', medicoApellido: 'Lopez', especialidadNombre: 'Cardio', fecha_turno: '2025-10-28', hora_inicio: '10:00', hora_fin: '11:00' }] });
    await asignarTurno(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: '✅ Turno asignado y WhatsApp enviado' });
  });

  it('debe retornar 500 si hay error interno', async () => {
    connectDB.mockImplementation(() => { throw new Error('DB caída'); });
    req.body = { id_paciente: 1, id_turno: 2, id_obra_social: 1 };
    await asignarTurno(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error del servidor al asignar turno' });
  });
});
