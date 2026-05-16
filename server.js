require('dotenv').config();
const express = require('express');
const path    = require('path');
const os      = require('os');
const fs      = require('fs');
const { promisify } = require('util');
const libre   = require('libreoffice-convert');
const { generateDocx } = require('./lib/generateDocx');

const libreConvert = promisify(libre.convert);
const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Téléchargement DOCX ───────────────────────────────────────────────────────
app.post('/api/rapport/docx', async (req, res) => {
  try {
    const data = req.body;
    if (!data.numeroRapport) data.numeroRapport = buildNumero();
    const filename   = buildFilename(data, 'docx');
    const docxBuffer = await generateDocx(data);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(docxBuffer);
  } catch (err) {
    console.error('❌ Erreur docx :', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Téléchargement PDF ────────────────────────────────────────────────────────
app.post('/api/rapport/pdf', async (req, res) => {
  try {
    const data = req.body;
    if (!data.numeroRapport) data.numeroRapport = buildNumero();
    const filename   = buildFilename(data, 'pdf');
    const docxBuffer = await generateDocx(data);

    // Écrire le docx dans un fichier temp pour LibreOffice
    const tmpDocx = path.join(os.tmpdir(), `patsy_${Date.now()}.docx`);
    fs.writeFileSync(tmpDocx, docxBuffer);

    const pdfBuffer = await libreConvert(docxBuffer, '.pdf', undefined);
    fs.unlinkSync(tmpDocx);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('❌ Erreur pdf :', err);
    res.status(500).json({ error: err.message });
  }
});

function buildNumero() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
}

function buildFilename(data, ext) {
  const client = (data.clientNom || 'client').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  return `Rapport_Patsy-Rat_${data.numeroRapport}_${client}.${ext}`;
}

app.listen(PORT, () => {
  console.log(`🐦🐀 Patsy-Rat app démarrée sur http://localhost:${PORT}`);
});
