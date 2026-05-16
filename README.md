# 🐦🐀 Patsy-Rat — Application de compte-rendu d'intervention

Application web permettant de générer, envoyer par email et sauvegarder sur Google Drive les comptes-rendus d'intervention.

---

## 🚀 Déploiement sur Railway via GitHub

### 1. Préparer le dépôt GitHub

```bash
git init
git add .
git commit -m "Initial commit - Patsy-Rat app"
git branch -M main
git remote add origin https://github.com/TON_COMPTE/patsy-rat-app.git
git push -u origin main
```

### 2. Créer le projet sur Railway

1. Va sur [railway.app](https://railway.app) → **New Project**
2. Sélectionne **Deploy from GitHub repo**
3. Choisis ton dépôt `patsy-rat-app`
4. Railway détecte automatiquement le `Dockerfile`

### 3. Configurer les variables d'environnement sur Railway

Dans ton projet Railway → **Variables** → ajoute :

| Variable | Valeur |
|----------|--------|
| `PORT` | `3000` |
| `GMAIL_USER` | `ton.email@gmail.com` |
| `GMAIL_APP_PASSWORD` | `xxxx xxxx xxxx xxxx` |
| `FROM_NAME` | `Patsy-Rat` |
| `FROM_EMAIL` | `ton.email@gmail.com` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `patsy-rat@...iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\n...` |
| `GOOGLE_DRIVE_FOLDER_ID` | `1AbCdEfGhIjKlMnOpQrStUvWxYz` |

---

## ⚙️ Configuration Gmail (App Password)

1. Active la **validation en 2 étapes** sur ton compte Google
2. Va sur : https://myaccount.google.com/apppasswords
3. Crée un mot de passe pour "Patsy-Rat App"
4. Copie les 16 caractères → variable `GMAIL_APP_PASSWORD`

---

## ⚙️ Configuration Google Drive (Compte de service)

### Étape 1 — Créer le compte de service
1. Va sur https://console.cloud.google.com
2. Crée un projet (ex. `patsy-rat`)
3. Active l'API **Google Drive API** (Bibliothèque → chercher Drive → Activer)
4. Va dans **IAM & Admin → Comptes de service → Créer**
5. Donne-lui un nom (ex. `patsy-rat-drive`)
6. Dans l'onglet **Clés → Ajouter une clé → JSON**
7. Télécharge le fichier JSON

### Étape 2 — Extraire les infos du JSON
Dans le fichier téléchargé, récupère :
- `client_email` → variable `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → variable `GOOGLE_PRIVATE_KEY` (avec les `\n` littéraux)

### Étape 3 — Partager le dossier Drive
1. Sur Google Drive, crée un dossier "Rapports Patsy-Rat"
2. Clic droit → **Partager** → colle l'email du compte de service
3. Donne-lui le rôle **Éditeur**
4. L'ID du dossier est dans l'URL : `drive.google.com/drive/folders/`**`CET_ID`**

---

## 🖼️ Logo

Place le logo dans `public/logo.jpg` (format JPG ou PNG renommé en .jpg).

---

## 🛠️ Développement local

```bash
cp .env.example .env
# Remplis le .env avec tes vraies valeurs

npm install
npm run dev
# → http://localhost:3000
```

---

## 📁 Structure

```
patsy-rat-app/
├── server.js              # Serveur Express (API)
├── package.json
├── Dockerfile             # Pour Railway
├── .env.example           # Variables à configurer
├── .gitignore
├── public/
│   ├── index.html         # Formulaire web responsive
│   └── logo.jpg           # Logo Patsy-Rat (à placer ici)
└── lib/
    ├── generateDocx.js    # Génération du .docx
    ├── sendEmail.js       # Envoi Gmail SMTP
    └── googleDrive.js     # Upload Google Drive
```

---

## 📡 API

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/rapport` | Génère, envoie par email et upload sur Drive |
| `POST` | `/api/rapport/download` | Télécharge le .docx directement |
| `GET` | `/health` | Health check Railway |
