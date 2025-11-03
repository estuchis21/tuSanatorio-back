require('dotenv').config();
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const FROM = process.env.TWILIO_WHATSAPP_FROM;

/**
 * Envía WhatsApp desde Twilio Sandbox
 * @param {string} telefono - número sin +54 ni 9, ejemplo: 1112345678
 * @param {string} mensaje - texto a enviar
 */
const enviarWhatsApp = async (telefono, mensaje) => {
  try {
    const to = `whatsapp:+549${telefono}`; // formato Argentina
    const message = await client.messages.create({
      from: FROM,
      to,
      body: mensaje,
    });
    console.log('✅ WhatsApp enviado:', message.sid);
  } catch (error) {
    console.error('❌ Error al enviar WhatsApp:', error);
  }
};

module.exports = { enviarWhatsApp };
