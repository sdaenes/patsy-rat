FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm install --omit=dev

# Copier le reste du projet
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
