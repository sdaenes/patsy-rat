const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

/**
 * Envoie le compte-rendu par email au client
 * @param {Object} data     - Données du formulaire
 * @param {Buffer} docxBuffer - Le fichier .docx généré
 */
async function sendReportByEmail(data, docxBuffer) {
  const transporter = createTransporter();

  const filename = `Rapport_Patsy-Rat_${data.numeroRapport}_${data.clientNom.replace(/\s+/g, '_')}.docx`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <div style="background: #2D5016; padding: 24px 32px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">Patsy-Rat</h1>
        <p style="color: #C8E6A0; margin: 4px 0 0; font-size: 14px;">Dépigeonnage & Dératisation</p>
      </div>
      <div style="background: #f9fafb; padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="color: #222; font-size: 15px;">Bonjour <strong>${data.clientContact || data.clientNom}</strong>,</p>
        <p style="color: #444; font-size: 14px; line-height: 1.6;">
          Veuillez trouver ci-joint le compte-rendu de notre intervention du <strong>${data.dateIntervention}</strong>
          sur votre site : <strong>${data.clientAdresse}, ${data.clientVille}</strong>.
        </p>
        <div style="background: #EAF3E0; border-left: 4px solid #4A7C2F; padding: 16px 20px; border-radius: 4px; margin: 24px 0;">
          <table style="font-size: 13px; color: #333; width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 4px 8px 4px 0; font-weight: bold; color: #2D5016;">N° rapport</td><td>${data.numeroRapport}</td></tr>
            <tr><td style="padding: 4px 8px 4px 0; font-weight: bold; color: #2D5016;">Date</td><td>${data.dateIntervention}</td></tr>
            <tr><td style="padding: 4px 8px 4px 0; font-weight: bold; color: #2D5016;">Espèces ciblées</td><td>${(data.especes || []).join(', ')}</td></tr>
            <tr><td style="padding: 4px 8px 4px 0; font-weight: bold; color: #2D5016;">Nuisibles régulés</td><td>${data.nbRegules || '—'}</td></tr>
            <tr><td style="padding: 4px 8px 4px 0; font-weight: bold; color: #2D5016;">Nuisibles ramassés</td><td>${data.nbRamasses || '—'}</td></tr>
          </table>
        </div>
        <p style="color: #444; font-size: 14px; line-height: 1.6;">
          Pour toute question, n'hésitez pas à nous contacter :<br>
          📞 <strong>06 77 11 00 80</strong> — ✉️ <strong>pdaenes@gmail.com</strong>
        </p>
        <p style="color: #444; font-size: 14px;">Cordialement,</p>
        <p style="color: #2D5016; font-weight: bold; font-size: 14px;">Patrice DAENES — Patsy-Rat</p>
      </div>
      <div style="background: #e5e7eb; padding: 12px 32px; border-radius: 0 0 8px 8px; text-align: center;">
        <p style="color: #888; font-size: 11px; margin: 0;">17 Rue de la Borde – 77390 BEAUVOIR | SIRET 343 176 368 00029</p>
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"${process.env.FROM_NAME || 'Patsy-Rat'}" <${process.env.FROM_EMAIL || process.env.GMAIL_USER}>`,
    to: data.clientEmail,
    subject: `Compte-rendu d'intervention N°${data.numeroRapport} – Patsy-Rat`,
    html: htmlBody,
    attachments: [
      {
        filename,
        content: docxBuffer,
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }
    ]
  });

  console.log(`✅ Email envoyé à ${data.clientEmail} — Message ID: ${info.messageId}`);
  return info;
}

module.exports = { sendReportByEmail };
