const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = 'whatsapp:+14155238886';
const toNumber = 'whatsapp:+541164475239';

if (!accountSid || !authToken) {
  console.error('❌ Error: Faltan las variables de entorno TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

client.messages
  .create({
    body: '🌸 Prueba desde Beauty Divina - El sistema está funcionando correctamente.',
    from: fromNumber,
    to: toNumber
  })
  .then(message => console.log('✅ Mensaje enviado. SID:', message.sid))
  .catch(error => console.error('❌ Error al enviar:', error));
