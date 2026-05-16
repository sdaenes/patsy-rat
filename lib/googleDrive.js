const { google } = require('googleapis');
const { Readable } = require('stream');

function getAuthClient() {
  // La clé privée depuis Railway peut avoir des \n littéraux — on les corrige
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return auth;
}

/**
 * Upload le fichier .docx sur Google Drive
 * @param {Buffer} docxBuffer - Le contenu du fichier
 * @param {string} filename   - Nom du fichier sur Drive
 * @returns {string} L'URL publique du fichier
 */
async function uploadToDrive(docxBuffer, filename) {
  const auth     = getAuthClient();
  const drive    = google.drive({ version: 'v3', auth });
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  // Convertir le Buffer en stream lisible
  const stream = Readable.from(docxBuffer);

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      parents: folderId ? [folderId] : [],
    },
    media: {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      body: stream,
    },
    fields: 'id, name, webViewLink',
  });

  const fileId = response.data.id;

  // Rendre le fichier lisible par quiconque ayant le lien
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  console.log(`✅ Fichier uploadé sur Drive : ${response.data.webViewLink}`);
  return {
    fileId,
    fileName: response.data.name,
    webViewLink: response.data.webViewLink,
  };
}

module.exports = { uploadToDrive };
