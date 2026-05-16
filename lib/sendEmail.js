const { google } = require('googleapis');

function getOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return oauth2Client;
}

function buildEmailRaw(data, docxBuffer, filename) {
  const to      = data.clientEmail;
  const from    = `"Patsy-Rat" <${process.env.GMAIL_USER}>`;
  const subject = `Compte-rendu d'intervention N°${data.numeroRapport} – Patsy-Rat`;
  const boundary = 'patsy_rat_boundary_' + Date.now();

  const htmlBody = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
  <div style="background:#2D5016;padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;margin:0;font-size:22px">Patsy-Rat</h1>
    <p style="color:#C8E6A0;margin:4px 0 0;font-size:14px">Dépigeonnage &amp; Dératisation</p>
  </div>
  <div style="background:#f9fafb;padding:32px;border:1px solid #e5e7eb;border-top:none">
    <p style="color:#222;font-size:15px">Bonjour <strong>${data.clientContact || data.clientNom}</strong>,</p>
    <p style="color:#444;font-size:14px;line-height:1.6">
      Veuillez trouver ci-joint le compte-rendu de notre intervention du <strong>${data.dateIntervention}</strong>
      sur votre site : <strong>${data.clientAdresse}, ${data.clientVille}</strong>.
    </p>
    <div style="background:#EAF3E0;border-left:4px solid #4A7C2F;padding:16px 20px;border-radius:4px;margin:24px 0">
      <table style="font-size:13px;color:#333;width:100%;border-collapse:collapse">
        <tr><td style="padding:4px 8px 4px 0;font-weight:bold;color:#2D5016">N° rapport</td><td>${data.numeroRapport}</td></tr>
        <tr><td style="padding:4px 8px 4px 0;font-weight:bold;color:#2D5016">Date</td><td>${data.dateIntervention}</td></tr>
        <tr><td style="padding:4px 8px 4px 0;font-weight:bold;color:#2D5016">Espèces ciblées</td><td>${(data.especes||[]).join(', ')}</td></tr>
        <tr><td style="padding:4px 8px 4px 0;font-weight:bold;color:#2D5016">Nuisibles régulés</td><td>${data.nbRegules||'—'}</td></tr>
      </table>
    </div>
    <p style="color:#444;font-size:14px;line-height:1.6">
      Pour toute question :<br>📞 <strong>06 77 11 00 80</strong> — ✉️ <strong>pdaenes@gmail.com</strong>
    </p>
    <p style="color:#2D5016;font-weight:bold;font-size:14px">Patrice DAENES — Patsy-Rat</p>
  </div>
  <div style="background:#e5e7eb;padding:12px 32px;border-radius:0 0 8px 8px;text-align:center">
    <p style="color:#888;font-size:11px;margin:0">17 Rue de la Borde – 77390 BEAUVOIR | SIRET 343 176 368 00029</p>
  </div>
</div>`;

  const docxBase64 = docxBuffer.toString('base64');

  const raw = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    Buffer.from(htmlBody).toString('base64'),
    ``,
    `--${boundary}`,
    `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`,
    `Content-Transfer-Encoding: base64`,
    `Content-Disposition: attachment; filename="${filename}"`,
    ``,
    docxBase64,
    ``,
    `--${boundary}--`,
  ].join('\r\n');

  return Buffer.from(raw).toString('base64url');
}

async function sendReportByEmail(data, docxBuffer) {
  const auth  = getOAuth2Client();
  const gmail = google.gmail({ version: 'v1', auth });

  const filename = `Rapport_Patsy-Rat_${data.numeroRapport}_${(data.clientNom||'client').replace(/\s+/g,'_')}.docx`;
  const rawEmail = buildEmailRaw(data, docxBuffer, filename);

  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: rawEmail },
  });

  console.log(`✅ Email envoyé via API Gmail — ID: ${response.data.id}`);
  return response.data;
}

module.exports = { sendReportByEmail };
