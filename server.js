require('dotenv').config();
const express = require('express');
const path    = require('path');
const { generateDocx }      = require('./lib/generateDocx');
const { sendReportByEmail } = require('./lib/sendEmail');
const { uploadToDrive }     = require('./lib/googleDrive');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Health check (Railway l'utilise) ─────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Route principale : génération + envoi + upload ────────────────────────────
app.post('/api/rapport', async (req, res) => {
  try {
    const data = req.body;

    // Validation minimale
    if (!data.clientEmail || !data.dateIntervention) {
      return res.status(400).json({ error: 'Champs obligatoires manquants (email client, date).' });
    }

    // Auto-numérotation si absent
    if (!data.numeroRapport) {
      const now = new Date();
      data.numeroRapport = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    }

    const filename = `Rapport_Patsy-Rat_${data.numeroRapport}_${(data.clientNom || 'client').replace(/\s+/g, '_')}.docx`;

    console.log(`📄 Génération du rapport ${filename}…`);
    const docxBuffer = await generateDocx(data);

    // Envoi email + upload Drive en parallèle
    const [emailInfo, driveInfo] = await Promise.allSettled([
      sendReportByEmail(data, docxBuffer),
      uploadToDrive(docxBuffer, filename),
    ]);

    const result = {
      success: true,
      filename,
      email: emailInfo.status === 'fulfilled'
        ? { sent: true, to: data.clientEmail }
        : { sent: false, error: emailInfo.reason?.message },
      drive: driveInfo.status === 'fulfilled'
        ? { uploaded: true, link: driveInfo.value.webViewLink }
        : { uploaded: false, error: driveInfo.reason?.message },
    };

    console.log('✅ Rapport traité :', result);
    res.json(result);

  } catch (err) {
    console.error('❌ Erreur génération rapport :', err);
    res.status(500).json({ error: err.message || 'Erreur serveur' });
  }
});

// ── Téléchargement direct (preview) ──────────────────────────────────────────
app.post('/api/rapport/download', async (req, res) => {
  try {
    const data = req.body;
    if (!data.numeroRapport) data.numeroRapport = 'PREVIEW';
    const docxBuffer = await generateDocx(data);
    const filename   = `Rapport_Patsy-Rat_${data.numeroRapport}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(docxBuffer);
  } catch (err) {
    console.error('❌ Erreur download :', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🐦🐀 Patsy-Rat app démarrée sur http://localhost:${PORT}`);
});
