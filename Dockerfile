FROM node:20-bullseye-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY server.js index.html ./
RUN mkdir -p data

EXPOSE 3000
CMD ["node", "server.js"]
