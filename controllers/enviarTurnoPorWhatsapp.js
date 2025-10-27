// controllers/turnosController.js
const { connectDB } = require('../config/db');
const sql = require('mssql');
const twilio = require('twilio');
require('dotenv').config();

// Configuración Twilio Sandbox
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_WHATSAPP_FROM = 'whatsapp:+14155238886'; // Sandbox

/**
 * Envía WhatsApp usando Twilio Sandbox
 * @param {string} telefono - número del paciente (solo números)
 * @param {string} mensaje - texto a enviar
 */
exports.enviarWhatsAppTurno = async (telefono, mensaje) => {
  try {
    // No agregamos +54 ni 9, usamos tal cual
    const telefonoFormateado = `whatsapp:+549${telefono}`;

    await client.messages.create({
      from: TWILIO_WHATSAPP_FROM,
      to: telefonoFormateado,
      body: mensaje,
    });

    console.log('✅ WhatsApp enviado a', telefonoFormateado);
  } catch (error) {
    console.error('❌ Error al enviar WhatsApp:', error);
  }
};