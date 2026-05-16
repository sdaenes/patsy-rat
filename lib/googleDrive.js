const { google } = require('googleapis');
const { Readable } = require('stream');

function getAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return oauth2Client;
}

async function uploadToDrive(docxBuffer, filename) {
  const auth     = getAuthClient();
  const drive    = google.drive({ version: 'v3', auth });
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const stream   = Readable.from(docxBuffer);

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

  // Accessible via lien
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  console.log(`✅ Fichier uploadé sur Drive : ${response.data.webViewLink}`);
  return { fileId, fileName: response.data.name, webViewLink: response.data.webViewLink };
}

module.exports = { uploadToDrive };
